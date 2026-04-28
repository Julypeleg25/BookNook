import { Types } from "mongoose";
import { userRepository } from "@repositories/userRepository";
import { ValidationError } from "@utils/errors";
import {
  getBookByGoogleIdFromGoogle,
  getLocalBookByGoogleId,
  normalizeLocalBookSummary,
  normalizeBookSummary,
} from "./bookService";
import { BookSummary } from "@models/ApiBook";
import { logger } from "@utils/logger";

type ListType = "wish" | "read";

const isValidListType = (listType: string): listType is ListType =>
  listType === "wish" || listType === "read";

function assertValidListType(listType: string): asserts listType is ListType {
  if (!isValidListType(listType)) {
    throw new ValidationError("Invalid list type");
  }
}

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

export const addBookToUserList = async (
  userId: Types.ObjectId | string,
  bookId: string,
  listType: ListType,
): Promise<string[]> => {
  assertValidListType(listType);
  return await userRepository.addBookToList(userId, bookId, listType);
};

export const getUserWishOrReadlist = async (
  userId: Types.ObjectId | string,
  listType: ListType,
): Promise<BookSummary[]> => {
  assertValidListType(listType);
  const googleIds = await userRepository.getList(userId, listType);
  const books = await Promise.all(googleIds.map(resolveBookSummary));

  return books.filter((book): book is BookSummary => book !== null);
};

export const removeBookFromUserList = async (
  userId: Types.ObjectId | string,
  bookId: string,
  listType: ListType,
): Promise<string[]> => {
  assertValidListType(listType);
  return await userRepository.removeBookFromList(userId, bookId, listType);
};
