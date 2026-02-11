import { Types } from "mongoose";
import { IUserReview } from "@models/UserReview";
import { userReviewRepository, PopulatedUserReview } from "@repositories/userReviewRepository";
import { getOrCreateLocalBook } from "./bookService";
import { recomputeBookRating } from "./ratingService";
import { NotFoundError } from "@utils/errors";

export const createReview = async (
  userId: Types.ObjectId,
  externalBookId: string,
  rating: number,
  reviewText?: string,
  picturePath?: string
): Promise<IUserReview> => {
  const book = await getOrCreateLocalBook(externalBookId);

  // Fallback image logic: if no picturePath provided, use book thumbnail
  const finalPicturePath = picturePath || book.thumbnail;

  const newReview = await userReviewRepository.create({
    user: userId,
    book: book._id,
    rating,
    review: reviewText,
    picturePath: finalPicturePath,
  });

  await recomputeBookRating(book._id.toString());

  return newReview;
};

export const getAllReviews = async (): Promise<PopulatedUserReview[]> => {
  return await userReviewRepository.findAll();
};

export const getReviewsByUserId = async (
  userId: string
): Promise<PopulatedUserReview[]> => {
  return await userReviewRepository.findByUserId(userId);
};

export const getReviewsByBookId = async (
  bookId: string
): Promise<PopulatedUserReview[]> => {
  return await userReviewRepository.findByBookId(bookId);
};

export const getReviewById = async (
  reviewId: string
): Promise<PopulatedUserReview> => {
  const review = await userReviewRepository.findByIdWithUser(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  return review;
};

interface UpdateReviewData {
  review?: string;
  rating?: number;
  picturePath?: string;
}

export const updateReview = async (
  reviewId: string,
  updateData: UpdateReviewData
): Promise<IUserReview> => {
  const updatedReview = await userReviewRepository.update(reviewId, updateData);
  if (!updatedReview) {
    throw new NotFoundError("Review not found");
  }

  await recomputeBookRating(updatedReview.book.toString());

  return updatedReview;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  await userReviewRepository.delete(reviewId);
  await recomputeBookRating(review.book.toString());
};

export const isReviewAuthor = async (
  reviewId: string,
  userId: string
): Promise<boolean> => {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    return false;
  }
  return review.user.toString() === userId;
};

