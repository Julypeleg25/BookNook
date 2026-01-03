import { Types } from "mongoose";
import { bookRepository } from "../repositories/bookRepository";
import { userReviewRepository } from "../repositories/userReviewRepository";
import { logger } from "../utils/logger";

export async function recomputeBookRating(bookId: string): Promise<void> {
  try {
    const { totalRating, count } = await userReviewRepository.aggregateRatingsByBook(bookId);
    const avgRating = count > 0 ? totalRating / count : 0;

    await bookRepository.updateRating(bookId, avgRating, count, totalRating);
  } catch (error) {
    logger.error(`Error recomputing rating for book ${bookId}:`, error);
    throw error;
  }
}
