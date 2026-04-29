import { Types } from "mongoose";
import { userRepository } from "@repositories/userRepository";
import {
  getBookByGoogleIdFromGoogle,
  getLocalBookByGoogleId,
  getLocalBookByLocalId,
  normalizeLocalBookSummary,
  normalizeBookSummary,
} from "./bookService";
import { BookSummary } from "@models/ApiBook";
import { logger } from "@utils/logger";
import type { IBook } from "@models/Book";

const findLocalWishlistBook = async (bookId: string): Promise<IBook | null> => {
  const localBookByExternalId = await getLocalBookByGoogleId(bookId);
  if (localBookByExternalId) {
    return localBookByExternalId;
  }

  if (!Types.ObjectId.isValid(bookId)) {
    return null;
  }

  return await getLocalBookByLocalId(bookId);
};

const getWishlistStorageIds = async (bookId: string): Promise<string[]> => {
  const localBook = await findLocalWishlistBook(bookId);
  if (!localBook) {
    return [bookId];
  }

  return Array.from(new Set([bookId, localBook.externalId, localBook._id.toString()]));
};

const resolveBookSummary = async (bookId: string): Promise<BookSummary | null> => {
  try {
    const localBook = await findLocalWishlistBook(bookId);
    if (localBook) {
      return normalizeLocalBookSummary(localBook);
    }
  } catch (localLookupError) {
    logger.warn(
      `Failed to resolve local book data for wishlist item ${bookId}.`,
      localLookupError,
    );
  }

  try {
    const googleBook = await getBookByGoogleIdFromGoogle(bookId);
    return normalizeBookSummary(googleBook);
  } catch (googleLookupError) {
    logger.warn(
      `Skipping wishlist item ${bookId} because it is unavailable in both local storage and Google Books.`,
      googleLookupError,
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
  const bookIds = await getWishlistStorageIds(bookId);
  await userRepository.removeBookFromWishlist(userId, bookIds);
  return await getUserWishlist(userId);
};
