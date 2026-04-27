import { Types } from "mongoose";
import { IUserReview } from "@models/UserReview";
import { userReviewRepository, PopulatedUserReview } from "@repositories/userReviewRepository";
import { getOrCreateLocalBook, getGoogleBookByLocalId } from "./bookService";
import { recomputeBookRating } from "./ratingService";
import { NotFoundError } from "@utils/errors";
import { bookRepository } from "@repositories/bookRepository";
import { IUser } from "@models/User";
import { IBook } from "@models/Book";
import { syncReviewToVector, deleteReviewFromVector, syncUserProfileToVector } from "@services/ai/vectorSyncService";
import User from "@models/User";
import { logger } from "@utils/logger";


export const createReview = async (
  userId: Types.ObjectId,
  externalBookId: string,
  rating: number,
  reviewText?: string,
  picturePath?: string
): Promise<IUserReview> => {
  const book = await getOrCreateLocalBook(externalBookId);

  const finalPicturePath = picturePath || book.thumbnail;

  const newReview = await userReviewRepository.create({
    user: userId,
    book: book._id,
    rating,
    review: reviewText,
    picturePath: finalPicturePath,
  });

  await recomputeBookRating(book._id.toString());

  await syncReviewToVector(newReview);

  const user = await User.findById(userId);
  if (user) {
    await syncUserProfileToVector(user);
  }

  return newReview;
};

import { userRepository } from "@repositories/userRepository";

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
    userIdFilter = matchingUsers.map((u: IUser) => u._id as Types.ObjectId);
  }

  let genreBookIds: Types.ObjectId[] | undefined;
  if (genre) {
    const { items: booksInGenre } = await bookRepository.localSearchBooks({
      subject: genre,
      limit: 1000
    });
    if (booksInGenre.length === 0) return [];
    genreBookIds = booksInGenre.map((b: IBook) => b._id as Types.ObjectId);
  }

  let searchBookIds: Types.ObjectId[] | undefined;
  if (searchQuery) {
    const { items: matchingBooks } = await bookRepository.localSearchBooks({
      title: searchQuery
    });
    if (matchingBooks.length > 0) {
      searchBookIds = matchingBooks.map((b: IBook) => b._id as Types.ObjectId);
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
      const reviewObj = typeof review.toObject === 'function' ? review.toObject() : review;
      const bookId = extractBookId(reviewObj.book);

      try {
        if (!bookId) {
          throw new Error(`Could not determine book ID for review ${review._id}`);
        }
        const fullBook = await getGoogleBookByLocalId(bookId);
        const normalizedBook = normalizeBookDetail(fullBook);
        return { ...reviewObj, book: normalizedBook };
      } catch (error) {
        logger.warn(`Error enriching review ${review._id}:`, error);
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

    const fullBook = await getGoogleBookByLocalId(bookId);
    const { normalizeBookDetail } = await import("./bookService");
    const normalizedBook = normalizeBookDetail(fullBook);

    return {
      ...review.toObject(),
      book: normalizedBook
    };
  } catch (error) {
    logger.warn(`Error enriching review ${reviewId}:`, error);
    return {
      ...review.toObject(),
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

  await recomputeBookRating(updatedReview.book.toString());

  await syncReviewToVector(updatedReview);

  const user = await User.findById(updatedReview.user.toString());
  if (user) {
    await syncUserProfileToVector(user);
  }

  return updatedReview;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const review = await userReviewRepository.findById(reviewId);
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  await userReviewRepository.delete(reviewId);
  await recomputeBookRating(review.book.toString());

  await deleteReviewFromVector(reviewId);

  const user = await User.findById(review.user.toString());
  if (user) {
    await syncUserProfileToVector(user);
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
  return review.user.toString() === userId;
};

