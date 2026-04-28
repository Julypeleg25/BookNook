import dotenv from "dotenv";
import mongoose, { Types } from "mongoose";
import { ENV } from "@config/config";
import { BookModel } from "@models/Book";
import User from "@models/User";
import { UserReviewModel } from "@models/UserReview";
import { buildBookChunk, buildProfileChunk, buildReviewChunk } from "@services/ai/chunkBuilder";
import { generateEmbeddingsBatch } from "@services/ai/embeddingService";
import { ensureSchema, upsertChunksBatch, VectorChunk } from "@services/ai/vectorRepository";
import { logger } from "@utils/logger";

dotenv.config();

const BATCH_SIZE = 32;

async function getTypicalTasteMap(): Promise<Map<string, string[]>> {
  const reviews = await UserReviewModel.find({});
  const allBooks = await BookModel.find({}, { _id: 1, categories: 1 });

  const bookMap = new Map(
    allBooks.map((book) => [
      (book._id as Types.ObjectId).toString(),
      book.categories || [],
    ]),
  );

  const userTasteCounts = new Map<string, Map<string, number>>();

  for (const review of reviews) {
    const userId = (review.user as Types.ObjectId).toString();
    const bookId = (review.book as Types.ObjectId).toString();
    const genres = bookMap.get(bookId) || [];

    if (!userTasteCounts.has(userId)) {
      userTasteCounts.set(userId, new Map());
    }

    const counts = userTasteCounts.get(userId);
    if (!counts) continue;

    for (const genre of genres) {
      counts.set(genre, (counts.get(genre) || 0) + 1);
    }
  }

  const tasteMap = new Map<string, string[]>();
  for (const [userId, counts] of userTasteCounts.entries()) {
    const topGenres = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
    tasteMap.set(userId, topGenres);
  }

  return tasteMap;
}

async function indexBooks(): Promise<void> {
  const books = await BookModel.find({});
  logger.info(`[IndexData] Indexing ${books.length} books...`);

  const chunks: VectorChunk[] = [];
  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    const texts = batch.map((book) => buildBookChunk(book));
    const embeddings = await generateEmbeddingsBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const book = batch[j];
      const bookId = (book._id as Types.ObjectId).toString();

      chunks.push({
        sourceId: `book:${bookId}`,
        bookId,
        type: "book",
        text: texts[j],
        embedding: embeddings[j],
        rating: book.avgRating ?? null,
        metadata: {
          mongoId: bookId,
          externalId: book.externalId,
          title: book.title,
          authors: book.authors ?? [],
          genres: book.categories ?? [],
        },
      });
    }

    logger.info(`[IndexData] Books: ${Math.min(i + BATCH_SIZE, books.length)}/${books.length}`);
  }

  await upsertChunksBatch(chunks, BATCH_SIZE);
}

async function indexUsers(
  tasteMap: Map<string, string[]>,
  allBooks: any[]
): Promise<void> {
  const users = await User.find({});
  logger.info(`[IndexData] Indexing ${users.length} users...`);

  const chunks: VectorChunk[] = [];
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const texts = batch.map((user) => {
      const resolveTitles = (ids: string[]) => {
        return ids.map((id) => {
          const b = allBooks.find((book) => book.externalId === id);
          return b ? `${b.title} (by ${b.authors?.join(", ")})` : null;
        }).filter((t): t is string => t !== null);
      };

      return buildProfileChunk(
        user.username,
        resolveTitles(user.readlist || []),
        resolveTitles(user.wishlist || []),
        [],
        [],
        tasteMap.get((user._id as Types.ObjectId).toString()) || [],
      );
    });
    const embeddings = await generateEmbeddingsBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const user = batch[j];
      const userId = (user._id as Types.ObjectId).toString();

      chunks.push({
        sourceId: `profile:${userId}`,
        bookId: "N/A",
        type: "profile",
        text: texts[j],
        embedding: embeddings[j],
        metadata: {
          userId,
          username: user.username,
          type: "profile",
        },
      });
    }

    logger.info(`[IndexData] Users: ${Math.min(i + BATCH_SIZE, users.length)}/${users.length}`);
  }

  await upsertChunksBatch(chunks, BATCH_SIZE);
}

async function indexReviews(
  tasteMap: Map<string, string[]>,
  allBooks: any[],
  allUsers: any[]
): Promise<void> {
  const reviews = await UserReviewModel.find({});

  const bookTitlesMap = new Map(
    allBooks.map((book) => [(book._id as Types.ObjectId).toString(), book.title]),
  );
  const userNamesMap = new Map(
    allUsers.map((user) => [(user._id as Types.ObjectId).toString(), user.username]),
  );

  logger.info(`[IndexData] Indexing ${reviews.length} reviews...`);

  const chunks: VectorChunk[] = [];
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const texts = batch.map((review) => {
      const userId = (review.user as Types.ObjectId).toString();
      const bookId = (review.book as Types.ObjectId).toString();

      return buildReviewChunk(
        userNamesMap.get(userId) || "User",
        bookTitlesMap.get(bookId) || "Unknown Book",
        review.rating,
        review.review,
        tasteMap.get(userId) || [],
      );
    });
    const embeddings = await generateEmbeddingsBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const review = batch[j];
      const reviewId = (review._id as Types.ObjectId).toString();
      const bookId = (review.book as Types.ObjectId).toString();
      const userId = (review.user as Types.ObjectId).toString();

      chunks.push({
        sourceId: `review:${reviewId}`,
        bookId,
        type: "review",
        text: texts[j],
        embedding: embeddings[j],
        rating: review.rating,
        metadata: {
          mongoId: reviewId,
          bookId,
          externalId: allBooks.find(b => (b._id as Types.ObjectId).toString() === bookId)?.externalId,
          userId,
          username: userNamesMap.get(userId),
          rating: review.rating,
        },
      });
    }

    logger.info(`[IndexData] Reviews: ${Math.min(i + BATCH_SIZE, reviews.length)}/${reviews.length}`);
  }

  await upsertChunksBatch(chunks, BATCH_SIZE);
}

async function run(): Promise<void> {
  try {
    await mongoose.connect(ENV.MONGODB_URL);
    logger.info("[IndexData] Connected to MongoDB.");

    await ensureSchema();

    const tasteMap = await getTypicalTasteMap();
    const allBooks = await BookModel.find({});
    const allUsers = await User.find({});

    await indexBooks();
    await indexUsers(tasteMap, allBooks);
    await indexReviews(tasteMap, allBooks, allUsers);

    logger.info("[IndexData] Full re-index complete.");
  } catch (error) {
    logger.error("[IndexData] Indexing failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
