
import { Types } from "mongoose";
import { userRepository } from "@repositories/userRepository";
import { ValidationError } from "@utils/errors";

export async function addBookToUserList(
  userId: Types.ObjectId | string,
  bookId: string,
  listType: "wish" | "read"
): Promise<string[]> {
  if (listType !== "wish" && listType !== "read") {
    throw new ValidationError("Invalid list type");
  }
  return await userRepository.addBookToList(userId, bookId, listType);
}

export async function getUserWishlist(
  userId: Types.ObjectId | string
): Promise<string[]> {
  return await userRepository.getList(userId, "wish");
}

export async function getUserReadlist(
  userId: Types.ObjectId | string
): Promise<string[]> {
  return await userRepository.getList(userId, "read");
}
