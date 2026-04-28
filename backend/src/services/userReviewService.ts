import { Types, FlattenMaps } from "mongoose";
import { BookDetail } from "@models/ApiBook";
import { IUserReview } from "@models/UserReview";
import { userReviewRepository, PopulatedUserReview } from "@repositories/userReviewRepository";
import * as bookService from "./bookService";
import * as ratingService from "./ratingService";
import { NotFoundError } from "@utils/errors";
import { bookRepository } from "@repositories/bookRepository";
import { IUser } from "@models/User";
import { IBook } from "@models/Book";
import * as vectorSyncService from "@services/ai/vectorSyncService";
import User from "@models/User";
import { logger } from "@utils/logger";
import { userRepository } from "@repositories/userRepository";
import {
  EnrichedUserReview,
  buildUnavailableBook,
  toReviewObject,
  extractObjectIdString,
  requireObjectIdString,
  ReviewDocumentLike
} from "@utils/reviewUtils";

const getNormalizedBookByLocalId = async (
  localBookId: string,
  cache?: Map<string, Promise<BookDetail>>
): Promise<BookDetail> => {
  const cachedBook = cache?.get(localBookId);
  if (cachedBook) {
    return cachedBook;
  }

  const loadBookPromise = userReviewServiceDeps
    .getGoogleBookByLocalId(localBookId)
    .then(bookService.normalizeBookDetail);

  if (cache) {
    cache.set(localBookId, loadBookPromise);
  }

  return loadBookPromise;
};

export const userReviewServiceDeps = {
  getOrCreateLocalBook: bookService.getOrCreateLocalBook,
  getGoogleBookByLocalId: bookService.getGoogleBookByLocalId,
  recomputeBookRating: ratingService.recomputeBookRating,
  syncReviewToVector: vectorSyncService.syncReviewToVector,
  deleteReviewFromVector: vectorSyncService.deleteReviewFromVector,
  syncUserProfileToVector: vectorSyncService.syncUserProfileToVector,
  findUserById: User.findById.bind(User),
};

export const createReview = async (
  userId: Types.ObjectId,
  externalBookId: string,
  rating: number,
  reviewText?: string,
  picturePath?: string
): Promise<IUserReview> => {
  const book = await userReviewServiceDeps.getOrCreateLocalBook(externalBookId);
  const bookId = book._id as Types.ObjectId;

  const newReview = await userReviewRepository.create({
    user: userId,
    book: bookId,
    rating,
    review: reviewText,
    picturePath,
  });

  await userReviewServiceDeps.recomputeBookRating(bookId.toString());
  await userReviewServiceDeps.syncReviewToVector(newReview);

  const user = await userReviewServiceDeps.findUserById(userId);
  if (user) {
    await userReviewServiceDeps.syncUserProfileToVector(user);
  }

  return newReview;
};

export const getAllReviews = async (
  minLikes?: number,
  searchQuery?: string,
  username?: string,
  rating?: number,
  genre?: string
): Promise<PopulatedUserReview[]> => {
  let userIdFilter: Types.ObjectId | Types.ObjectId[] | undefined;

  if (username) {
    const matchingUsers = await userRepository.findByUsernamePartial(username);
    if (matchingUsers.length === 0) {
      return [];
    }
    userIdFilter = matchingUsers.map((user: IUser) => user._id as Types.ObjectId);
  }

  let genreBookIds: Types.ObjectId[] | undefined;
  if (genre) {
    const { items: booksInGenre } = await bookRepository.localSearchBooks({
      subject: genre,
      limit: 1000,
    });
    if (booksInGenre.length === 0) {
      return [];
    }
    genreBookIds = booksInGenre.map((book: IBook) => book._id as Types.ObjectId);
  }

  let searchBookIds: Types.ObjectId[] | undefined;
  if (searchQuery) {
    const { items: matchingBooks } = await bookRepository.localSearchBooks({
      title: searchQuery,
    });
    if (matchingBooks.length > 0) {
      searchBookIds = matchingBooks.map((book: IBook) => book._id as Types.ObjectId);
    }
  }

  const reviews = await userReviewRepository.findAll(
    minLikes,
    searchQuery,
    userIdFilter,
    searchBookIds,
    rating,
    genre,
    genreBookIds
  );

  return reviews;
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

export const getEnrichedReviews = async (
  reviews: PopulatedUserReview[]
): Promise<EnrichedUserReview[]> => {
  const bookCache = new Map<string, Promise<BookDetail>>();

  return await Promise.all(
    reviews.map(async (review) => {
      const reviewDoc = review as ReviewDocumentLike;
      const reviewObject = toReviewObject(review);
      const bookId = extractObjectIdString(reviewObject.book);

      try {
        const resolvedBookId = requireObjectIdString(
          reviewObject.book,
          `book for review ${String(reviewDoc._id)}`
        );
        const normalizedBook = await getNormalizedBookByLocalId(
          resolvedBookId,
          bookCache
        );

        return { ...reviewObject, book: normalizedBook } as unknown as EnrichedUserReview;
      } catch (error) {
        logger.warn(`Error enriching review ${String(reviewDoc._id)}:`, error);
        return {
          ...reviewObject,
          book: buildUnavailableBook(bookId),
        } as unknown as EnrichedUserReview;
      }
    })
  );
};

export const getPopulatedReviewById = async (
  reviewId: string
): Promise<EnrichedUserReview> => {
  const review = await userReviewRepository.findByIdWithUser(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const reviewObject = toReviewObject(review);
  const bookId = extractObjectIdString(reviewObject.book);

  try {
    const resolvedBookId = requireObjectIdString(
      reviewObject.book,
      `book for review ${reviewId}`
    );
    const normalizedBook = await getNormalizedBookByLocalId(resolvedBookId);

    return {
      ...reviewObject,
      book: normalizedBook,
    } as unknown as EnrichedUserReview;
  } catch (error) {
    logger.warn(`Error enriching review ${reviewId}:`, error);
    return {
      ...reviewObject,
      book: buildUnavailableBook(bookId),
    } as unknown as EnrichedUserReview;
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

  const bookId = requireObjectIdString(updatedReview.book, "book");
  const userId = requireObjectIdString(updatedReview.user, "user");

  if (updateData.rating !== undefined) {
    await userReviewServiceDeps.recomputeBookRating(bookId);
  }

  await userReviewServiceDeps.syncReviewToVector(updatedReview);

  const user = await userReviewServiceDeps.findUserById(userId);
  if (user) {
    await userReviewServiceDeps.syncUserProfileToVector(user);
  }

  return updatedReview;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const bookId = requireObjectIdString(review.book, "book");
  const userId = requireObjectIdString(review.user, "user");

  await userReviewRepository.delete(reviewId);
  await userReviewServiceDeps.recomputeBookRating(bookId);
  await userReviewServiceDeps.deleteReviewFromVector(reviewId);

  const user = await userReviewServiceDeps.findUserById(userId);
  if (user) {
    await userReviewServiceDeps.syncUserProfileToVector(user);
  }
};

export const isReviewAuthor = async (
  reviewId: string,
  userId: string
): Promise<boolean> => {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    return false;
  }

  return requireObjectIdString(review.user, "user") === userId;
};
