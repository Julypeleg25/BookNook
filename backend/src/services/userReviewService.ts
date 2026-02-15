import { Types } from "mongoose";
import { IUserReview } from "@models/UserReview";
import { userReviewRepository, PopulatedUserReview } from "@repositories/userReviewRepository";
import { getOrCreateLocalBook, getGoogleBookByLocalId } from "./bookService";
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

import { userRepository } from "@repositories/userRepository";

export const getAllReviews = async (minLikes?: number, searchQuery?: string, username?: string): Promise<PopulatedUserReview[]> => {
  let userId: Types.ObjectId | undefined;

  if (username) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      return []; // Return empty if user not found
    }
    userId = user._id as Types.ObjectId;
  }

  return await userReviewRepository.findAll(minLikes, searchQuery, userId);
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

export const getPopulatedReviewById = async (
  reviewId: string
): Promise<any> => {
  const review = await userReviewRepository.findByIdWithUser(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const reviewObj = review.toObject();
  try {
    // Use the helper from bookService to fetch full Google Book data per user request
    const fullBook = await getGoogleBookByLocalId(reviewObj.book.toString());
    // Normalize the book data to match BookDetail interface expected by frontend
    const { normalizeBookDetail } = await import("./bookService");
    const normalizedBook = normalizeBookDetail(fullBook);

    return {
      ...reviewObj,
      book: normalizedBook
    };
  } catch (error) {
    console.warn(`Error enriching review ${reviewId}:`, error);
    // Fallback if book not found
    return {
      ...reviewObj,
      book: {
        id: reviewObj.book.toString(),
        title: "Book Unavailable",
        authors: ["Unknown"],
        thumbnail: "",
        description: "Could not load book data.",
        categories: [],
        pageCount: 0,
        previewLink: ""
      }
    };
  }
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

