
import { Types } from "mongoose";
import { userRepository } from "@repositories/userRepository";
import { ValidationError } from "@utils/errors";

export const addBookToUserList = async (
  userId: Types.ObjectId | string,
  bookId: string,
  listType: "wish" | "read"
): Promise<string[]> => {
  if (listType !== "wish" && listType !== "read") {
    throw new ValidationError("Invalid list type");
  }
  return await userRepository.addBookToList(userId, bookId, listType);
};

export const getUserWishlist = async (
  userId: Types.ObjectId | string
): Promise<string[]> => {
  return await userRepository.getList(userId, "wish");
};

export const getUserReadlist = async (
  userId: Types.ObjectId | string
): Promise<string[]> => {
  return await userRepository.getList(userId, "read");
};

export const removeBookFromUserList = async (
  userId: Types.ObjectId | string,
  bookId: string,
  listType: "wish" | "read"
): Promise<string[]> => {
  if (listType !== "wish" && listType !== "read") {
    throw new ValidationError("Invalid list type");
  }
  return await userRepository.removeBookFromList(userId, bookId, listType);
};
