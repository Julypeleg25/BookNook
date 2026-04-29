import { Types } from "mongoose";
import { userRepository } from "@repositories/userRepository";
import {
  getBookByGoogleIdFromGoogle,
  getLocalBookByGoogleId,
  normalizeLocalBookSummary,
  normalizeBookSummary,
} from "./bookService";
import { BookSummary } from "@models/ApiBook";
import { logger } from "@utils/logger";

const resolveBookSummary = async (googleId: string): Promise<BookSummary | null> => {
  try {
    const googleBook = await getBookByGoogleIdFromGoogle(googleId);
    return normalizeBookSummary(googleBook);
  } catch (googleLookupError) {
    logger.warn(
      `Falling back to local book data for list item ${googleId} after Google Books lookup failed.`,
      googleLookupError,
    );
  }

  try {
    const localBook = await getLocalBookByGoogleId(googleId);
    if (!localBook) {
      logger.warn(
        `Skipping list item ${googleId} because it is unavailable in both Google Books and local storage.`,
      );
      return null;
    }

    return normalizeLocalBookSummary(localBook);
  } catch (localLookupError) {
    logger.warn(
      `Failed to resolve fallback book data for list item ${googleId}.`,
      localLookupError,
    );
    return null;
  }
};

export const addBookToUserWishlist = async (
  userId: Types.ObjectId | string,
  bookId: string,
): Promise<BookSummary[]> => {
  await userRepository.addBookToWishlist(userId, bookId);
  return await getUserWishlist(userId);
};

export const getUserWishlist = async (
  userId: Types.ObjectId | string,
): Promise<BookSummary[]> => {
  const googleIds = await userRepository.getWishlist(userId);
  const books = await Promise.all(googleIds.map(resolveBookSummary));

  return books.filter((book): book is BookSummary => book !== null);
};

export const removeBookFromUserWishlist = async (
  userId: Types.ObjectId | string,
  bookId: string,
): Promise<BookSummary[]> => {
  await userRepository.removeBookFromWishlist(userId, bookId);
  return await getUserWishlist(userId);
};
