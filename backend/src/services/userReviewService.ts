import { Types } from "mongoose";
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

  const finalPicturePath = picturePath || (book as any).thumbnail;

  const newReview = await userReviewRepository.create({
    user: userId,
    book: (book._id as any),
    rating,
    review: reviewText,
    picturePath: finalPicturePath,
  });

  await userReviewServiceDeps.recomputeBookRating((book._id as any).toString());

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
    userIdFilter = matchingUsers.map((u: IUser) => (u._id as any) as Types.ObjectId);
  }

  let genreBookIds: Types.ObjectId[] | undefined;
  if (genre) {
    const { items: booksInGenre } = await bookRepository.localSearchBooks({
      subject: genre,
      limit: 1000
    });
    if (booksInGenre.length === 0) return [];
    genreBookIds = booksInGenre.map((b: IBook) => (b._id as any) as Types.ObjectId);
  }

  let searchBookIds: Types.ObjectId[] | undefined;
  if (searchQuery) {
    const { items: matchingBooks } = await bookRepository.localSearchBooks({
      title: searchQuery
    });
    if (matchingBooks.length > 0) {
      searchBookIds = matchingBooks.map((b: IBook) => (b._id as any) as Types.ObjectId);
    }
  }

  return await userReviewRepository.findAll(
    minLikes,
    searchQuery,
    userIdFilter,
    searchBookIds,
    rating,
    genre,
    genreBookIds
  );
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

const extractBookId = (bookField: unknown): string | null => {
  if (!bookField) return null;
  if (typeof bookField === 'string') return bookField;

  const bookObj = bookField as { _id?: string | Types.ObjectId; toString?: () => string };

  if (bookObj._id) {
    if (typeof bookObj._id === 'string') return bookObj._id;
    if (bookObj._id instanceof Types.ObjectId) return bookObj._id.toString();
  }

  if (bookField instanceof Types.ObjectId) return bookField.toString();

  try {
    const s = String(bookField);
    return (s && s !== "[object Object]") ? s : null;
  } catch {
    return null;
  }
};

export const getEnrichedReviews = async (reviews: (IUserReview | PopulatedUserReview)[]): Promise<PopulatedUserReview[]> => {
  const { normalizeBookDetail } = await import("./bookService");

  return Promise.all(
    reviews.map(async (review) => {
      const reviewObj = typeof (review as any).toObject === 'function' ? (review as any).toObject() : review;
      const bookId = extractBookId(reviewObj.book);

      try {
        if (!bookId) {
          throw new Error(`Could not determine book ID for review ${(review as any)._id}`);
        }
        const fullBook = await userReviewServiceDeps.getGoogleBookByLocalId(bookId);
        const normalizedBook = normalizeBookDetail(fullBook);
        return { ...reviewObj, book: normalizedBook };
      } catch (error) {
        logger.warn(`Error enriching review ${(review as any)._id}:`, error);
        return {
          ...reviewObj,
          book: {
            id: bookId || "unknown",
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
    })
  );
};

export const getPopulatedReviewById = async (
  reviewId: string
): Promise<PopulatedUserReview> => {
  const review = await userReviewRepository.findByIdWithUser(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const bookId = extractBookId(review.book);

  try {
    if (!bookId) {
      throw new Error(`Could not determine book ID for review ${reviewId}`);
    }

    const fullBook = await userReviewServiceDeps.getGoogleBookByLocalId(bookId);
    const { normalizeBookDetail } = await import("./bookService");
    const normalizedBook = normalizeBookDetail(fullBook);

    return {
      ...(review as any).toObject(),
      book: normalizedBook
    };
  } catch (error) {
    logger.warn(`Error enriching review ${reviewId}:`, error);
    return {
      ...(review as any).toObject(),
      book: {
        id: bookId || "unknown",
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

  await userReviewServiceDeps.recomputeBookRating((updatedReview.book as any).toString());

  await userReviewServiceDeps.syncReviewToVector(updatedReview);

  const user = await userReviewServiceDeps.findUserById((updatedReview.user as any).toString());
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

  await userReviewRepository.delete(reviewId);
  await userReviewServiceDeps.recomputeBookRating((review.book as any).toString());

  await userReviewServiceDeps.deleteReviewFromVector(reviewId);

  const user = await userReviewServiceDeps.findUserById((review.user as any).toString());
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
  return (review.user as any).toString() === userId;
};
