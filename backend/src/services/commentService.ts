import { Types } from "mongoose";
import { UserReviewModel } from "@models/UserReview";
import { NotFoundError, ForbiddenError } from "@utils/errors";

export const addComment = async (
  reviewId: string,
  userId: Types.ObjectId,
  comment: string
) => {
  const review = await UserReviewModel.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const updatedReview = await UserReviewModel.findByIdAndUpdate(
    reviewId,
    {
      $push: {
        comments: {
          user: userId,
          comment,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  ).populate("comments.user", "username avatar");

  return updatedReview?.comments ?? [];
};

export const deleteComment = async (
  reviewId: string,
  commentId: string,
  userId: string
) => {
  const review = await UserReviewModel.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const commentIndex = review.comments.findIndex(
    (c) => c._id!.toString() === commentId
  );

  if (commentIndex === -1) {
    throw new NotFoundError("Comment not found");
  }

  if (
    review.comments[commentIndex].user.toString() !== userId &&
    review.user.toString() !== userId
  ) {
    throw new ForbiddenError("Not authorized to delete this comment");
  }

  const updatedReview = await UserReviewModel.findByIdAndUpdate(
    reviewId,
    {
      $pull: {
        comments: { _id: commentId },
      },
    },
    { new: true }
  );

  return updatedReview?.comments ?? [];
};
