import { Types } from "mongoose";
import { IUserReview } from "@models/UserReview";
import { userReviewRepository } from "@repositories/userReviewRepository";
import { getOrCreateLocalBook } from "./bookService";
import { recomputeBookRating } from "./ratingService";
import { NotFoundError, ForbiddenError, ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";

export async function createReview(
  userId: Types.ObjectId,
  externalBookId: string,
  rating: number,
  reviewText?: string,
  picturePath?: string
): Promise<IUserReview> {
  try {
    const book = await getOrCreateLocalBook(externalBookId);

    const newReview = await userReviewRepository.create({
      user: userId,
      book: book._id,
      rating,
      review: reviewText,
      picturePath,
    });

    await recomputeBookRating(book._id.toString());

    return newReview;
  } catch (error) {
    logger.error("Error creating review:", error);
    throw error;
  }
}

export async function getAllReviews() {
  return await userReviewRepository.findAll();
}

export async function getReviewsByUserId(userId: string) {
  return await userReviewRepository.findByUserId(userId);
}

export async function getReviewById(reviewId: string): Promise<any> {
  const review = await userReviewRepository.findByIdWithUser(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  return review;
}

export async function updateReview(
  reviewId: string,
  updateData: {
    review?: string;
    rating?: number;
    picturePath?: string;
  }
): Promise<IUserReview> {
  try {
    const updatedReview = await userReviewRepository.update(reviewId, updateData);
    if (!updatedReview) {
      throw new NotFoundError("Review not found");
    }

    await recomputeBookRating(updatedReview.book.toString());

    return updatedReview;
  } catch (error) {
    logger.error(`Error updating review ${reviewId}:`, error);
    throw error;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const review = await userReviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    await userReviewRepository.delete(reviewId);
    await recomputeBookRating(review.book.toString());
  } catch (error) {
    logger.error(`Error deleting review ${reviewId}:`, error);
    throw error;
  }
}

export async function likeReview(
  reviewId: string,
  userId: Types.ObjectId
): Promise<number> {
  try {
    const review = await userReviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    if (review.user.toString() === userId.toString()) {
      throw new ForbiddenError("You can't like your own review");
    }

    await userReviewRepository.addLike(reviewId, userId);
    const updatedReview = await userReviewRepository.findById(reviewId);
    return updatedReview?.likes.length || 0;
  } catch (error) {
    logger.error(`Error liking review ${reviewId}:`, error);
    throw error;
  }
}

export async function isReviewAuthor(
  reviewId: string,
  userId: Types.ObjectId
): Promise<boolean> {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    return false;
  }
  return review.user.toString() === userId.toString();
}
