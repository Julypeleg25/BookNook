import mongoose from "mongoose";
import dotenv from "dotenv";
import { BookModel } from "@models/Book";
import { UserReviewModel } from "@models/UserReview";
import { generateEmbedding } from "@services/aiService";
import { COLLECTIONS, upsertData, initCollections } from "@services/qdrantService";
import { logger } from "@utils/logger";
import { ENV } from "@config/config";

dotenv.config();

/**
 * Sync Books to Qdrant
 */
async function indexBooks() {
  const books = await BookModel.find({});
  logger.info(`Indexing ${books.length} books...`);

  const points = [];
  for (const book of books) {
    // Combine fields for embedding as per requirements: title, description, genres
    // Note: Book schema uses 'categories', mapping to genres here.
    const textToEmbed = `${book.title}. Genres: ${book.categories.join(", ")}. Description: ${book.description || ""}`;
    const vector = await generateEmbedding(textToEmbed);

    points.push({
      id: book._id.toString(),
      vector,
      payload: {
        title: book.title,
        genres: book.categories,
        description: book.description || "",
        type: "book"
      },
    });
  }

  if (points.length > 0) {
    await upsertData(COLLECTIONS.BOOKS, points);
  }
}

/**
 * Sync Reviews to Qdrant
 */
async function indexReviews() {
  const reviews = await UserReviewModel.find({});
  logger.info(`Indexing ${reviews.length} reviews...`);

  const points = [];
  for (const review of reviews) {
    // Fields: content, rating, likesCount
    const textToEmbed = `Review: ${review.review}. Rating: ${review.rating}/5.`;
    const vector = await generateEmbedding(textToEmbed);

    points.push({
      id: review._id.toString(),
      vector,
      payload: {
        content: review.review,
        rating: review.rating,
        userId: review.user.toString(),
        bookId: review.book.toString(),
        type: "review"
      },
    });
  }

  if (points.length > 0) {
    await upsertData(COLLECTIONS.USERREVIEWS, points);
  }
}

async function runIndex() {
  try {
    await mongoose.connect(ENV.MONGODB_URL);
    logger.info("Connected to MongoDB for indexing");

    await initCollections();
    
    await indexBooks();
    await indexReviews();

    logger.info("Indexing complete!");
  } catch (err) {
    logger.error("Indexing failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

runIndex();
