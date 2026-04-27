import { Types } from "mongoose";
import { userRepository } from "@repositories/userRepository";
import { ValidationError } from "@utils/errors";
import {
  getBookByGoogleIdFromGoogle,
  normalizeBookSummary,
} from "./bookService";
import { BookSummary } from "@models/ApiBook";

export const addBookToUserList = async (
  userId: Types.ObjectId | string,
  bookId: string,
  listType: "wish" | "read",
): Promise<string[]> => {
  if (listType !== "wish" && listType !== "read") {
    throw new ValidationError("Invalid list type");
  }
  return await userRepository.addBookToList(userId, bookId, listType);
};

export const getUserWishOrReadlist = async (
  userId: Types.ObjectId | string,
  listType: "wish" | "read",
): Promise<BookSummary[]> => {
  const googleIds = await userRepository.getList(userId, listType);

  return Promise.all(
    googleIds.map(async (googleId) => {
      const res = await getBookByGoogleIdFromGoogle(googleId);
      return normalizeBookSummary(res);
    }),
  );
};

export const removeBookFromUserList = async (
  userId: Types.ObjectId | string,
  bookId: string,
  listType: "wish" | "read",
): Promise<string[]> => {
  if (listType !== "wish" && listType !== "read") {
    throw new ValidationError("Invalid list type");
  }
  return await userRepository.removeBookFromList(userId, bookId, listType);
};
