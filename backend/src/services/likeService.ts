import { Types } from "mongoose";
import { userReviewRepository } from "@repositories/userReviewRepository";
import { userRepository } from "@repositories/userRepository";
import { NotFoundError, ForbiddenError } from "@utils/errors";
import { syncUserProfileToVector } from "@services/ai/vectorSyncService";
import { logger } from "@utils/logger";

const syncLikedUserProfile = async (userId: Types.ObjectId): Promise<void> => {
  try {
    const user = await userRepository.findById(userId);
    if (user) {
      await syncUserProfileToVector(user);
    }
  } catch (error) {
    logger.warn(
      `Failed to sync profile after like state changed for user ${userId.toString()}.`,
      error,
    );
  }
};

export const likeReview = async (
  reviewId: string,
  userId: Types.ObjectId
): Promise<number> => {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  if (review.user.toString() === userId.toString()) {
    throw new ForbiddenError("You can't like your own review");
  }

  const updatedReview = await userReviewRepository.addLike(reviewId, userId);
  if (!updatedReview) {
    throw new NotFoundError("Review not found");
  }

  void syncLikedUserProfile(userId);

  return updatedReview.likes.length;
};

export const unlikeReview = async (
  reviewId: string,
  userId: Types.ObjectId
): Promise<number> => {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const updatedReview = await userReviewRepository.removeLike(reviewId, userId);
  if (!updatedReview) {
    throw new NotFoundError("Review not found");
  }

  void syncLikedUserProfile(userId);

  return updatedReview.likes.length;
};
