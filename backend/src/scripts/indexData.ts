import mongoose from "mongoose";
import dotenv from "dotenv";
import { BookModel } from "@models/Book";
import { UserReviewModel } from "@models/UserReview";
import User, { IUser } from "@models/User";
import { buildBookChunk, buildReviewChunk, buildProfileChunk } from "@services/ai/chunkBuilder";
import { generateEmbeddingsBatch } from "@services/ai/embeddingService";
import { ensureSchema, upsertChunksBatch, VectorChunk } from "@services/ai/vectorRepository";
import { logger } from "@utils/logger";
import { ENV } from "@config/config";

dotenv.config();

const BATCH_SIZE = 32;

async function getTypicalTasteMap(): Promise<Map<string, string[]>> {
  const reviews = await UserReviewModel.find({});
  const allBooks = await BookModel.find({}, { _id: 1, categories: 1 });
  
  const bookMap = new Map(allBooks.map(b => [(b._id as any).toString(), b.categories || []]));

  const userTasteCounts = new Map<string, Map<string, number>>();

  for (const review of reviews) {
    const userId = (review.user as any).toString();
    const bookId = (review.book as any).toString();
    const genres = bookMap.get(bookId) || [];

    if (!userTasteCounts.has(userId)) {
      userTasteCounts.set(userId, new Map());
    }
    const counts = userTasteCounts.get(userId)!;
    for (const g of genres) {
      counts.set(g, (counts.get(g) || 0) + 1);
    }
  }

  const tasteMap = new Map<string, string[]>();
  for (const [userId, counts] of userTasteCounts.entries()) {
    const top3 = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
    tasteMap.set(userId, top3);
  }

  return tasteMap;
}

async function indexBooks(): Promise<void> {
  const books = await BookModel.find({});
  logger.info(`[IndexData] Indexing ${books.length} books…`);

  const chunks: VectorChunk[] = [];
  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    const texts = batch.map(b => buildBookChunk(b));
    const embeddings = await generateEmbeddingsBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const book = batch[j];
      const bookIdStr = (book._id as any).toString();
      chunks.push({
        sourceId: `book:${bookIdStr}`,
        bookId: bookIdStr,
        type: "book",
        text: texts[j],
        embedding: embeddings[j],
        rating: book.avgRating ?? null,
        metadata: {
          mongoId: bookIdStr,
          title: book.title,
          authors: book.authors ?? [],
          genres: book.categories ?? [],
        },
      });
    }
    logger.info(`[IndexData]  Books: ${Math.min(i + BATCH_SIZE, books.length)}/${books.length}`);
  }
  await upsertChunksBatch(chunks, BATCH_SIZE);
}

async function indexUsers(tasteMap: Map<string, string[]>): Promise<void> {
  const users = await User.find({});
  logger.info(`[IndexData] Indexing ${users.length} users…`);

  const chunks: VectorChunk[] = [];
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const texts = batch.map(u => buildProfileChunk(
      u.username,
      u.readlist || [],
      u.wishlist || [],
      [],
      [],
      tasteMap.get((u._id as any).toString()) || []
    ));
    const embeddings = await generateEmbeddingsBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const user = batch[j];
      const userIdStr = (user._id as any).toString();
      chunks.push({
        sourceId: `profile:${userIdStr}`,
        bookId: "N/A",
        type: "profile",
        text: texts[j],
        embedding: embeddings[j],
        metadata: {
          userId: userIdStr,
          username: user.username,
          type: "profile"
        },
      });
    }
    logger.info(`[IndexData]  Users: ${Math.min(i + BATCH_SIZE, users.length)}/${users.length}`);
  }
  await upsertChunksBatch(chunks, BATCH_SIZE);
}

async function indexReviews(tasteMap: Map<string, string[]>): Promise<void> {
  const reviews = await UserReviewModel.find({});
  const allBooks = await BookModel.find({}, { _id: 1, title: 1 });
  const bookTitlesMap = new Map(allBooks.map(b => [(b._id as any).toString(), b.title]));
  
  const allUsers = await User.find({}, { _id: 1, username: 1 });
  const userNamesMap = new Map(allUsers.map(u => [(u._id as any).toString(), u.username]));

  logger.info(`[IndexData] Indexing ${reviews.length} reviews…`);

  const chunks: VectorChunk[] = [];
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const texts = batch.map(r => {
      const uId = (r.user as any).toString();
      const bId = (r.book as any).toString();
      return buildReviewChunk(
        userNamesMap.get(uId) || "User",
        bookTitlesMap.get(bId) || "Unknown Book",
        r.rating,
        r.review,
        tasteMap.get(uId) || []
      );
    });
    
    const embeddings = await generateEmbeddingsBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const review = batch[j];
      const rIdStr = (review._id as any).toString();
      const bIdStr = (review.book as any).toString();
      const uIdStr = (review.user as any).toString();

      chunks.push({
        sourceId: `review:${rIdStr}`,
        bookId: bIdStr,
        type: "review",
        text: texts[j],
        embedding: embeddings[j],
        rating: review.rating,
        metadata: {
          mongoId: rIdStr,
          bookId: bIdStr,
          userId: uIdStr,
          username: userNamesMap.get(uIdStr),
          rating: review.rating,
        },
      });
    }
    logger.info(`[IndexData]  Reviews: ${Math.min(i + BATCH_SIZE, reviews.length)}/${reviews.length}`);
  }
  await upsertChunksBatch(chunks, BATCH_SIZE);
}

async function run(): Promise<void> {
  try {
    await mongoose.connect(ENV.MONGODB_URL);
    logger.info("[IndexData] Connected to MongoDB.");

    await ensureSchema();

    const tasteMap = await getTypicalTasteMap();

    await indexBooks();
    await indexUsers(tasteMap);
    await indexReviews(tasteMap);

    logger.info("[IndexData] ✓ Full re-index complete.");
  } catch (err) {
    logger.error("[IndexData] Indexing failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();