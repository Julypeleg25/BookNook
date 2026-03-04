


import { Types } from "mongoose";
import { UserReviewModel } from "@models/UserReview";
import User from "@models/User";
import { NotFoundError, ForbiddenError } from "@utils/errors";
import { syncUserProfileToVector } from "@services/ai/vectorSyncService";

export const likeReview = async (
  reviewId: string,
  userId: Types.ObjectId
): Promise<number> => {
  const review = await UserReviewModel.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  if (review.user.toString() === userId.toString()) {
    throw new ForbiddenError("You can't like your own review");
  }

  const updatedReview = await UserReviewModel.findByIdAndUpdate(
    reviewId,
    { $addToSet: { likes: userId } },
    { new: true }
  );

  const user = await User.findById(userId);
  if (user) {
    syncUserProfileToVector(user).catch(err => console.error("Profile sync failed", err));
  }

  return updatedReview?.likes.length ?? 0;
};

export const unlikeReview = async (
  reviewId: string,
  userId: Types.ObjectId
): Promise<number> => {
  const review = await UserReviewModel.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const updatedReview = await UserReviewModel.findByIdAndUpdate(
    reviewId,
    { $pull: { likes: userId } },
    { new: true }
  );

  const user = await User.findById(userId);
  if (user) {
    syncUserProfileToVector(user).catch(err => console.error("Profile sync failed", err));
  }

  return updatedReview?.likes.length ?? 0;
};
