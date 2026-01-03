import { Types } from "mongoose";
import { userRepository } from "../repositories/userRepository";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export async function addBookToUserList(
  userId: Types.ObjectId | string,
  bookId: string,
  listType: "wish" | "read"
): Promise<string[]> {
  try {
    if (listType !== "wish" && listType !== "read") {
      throw new Error("Invalid list type");
    }
    return await userRepository.addBookToList(userId, bookId, listType);
  } catch (error) {
    logger.error(`Error adding book to ${listType}list:`, error);
    throw error;
  }
}

export async function getUserWishlist(userId: Types.ObjectId | string): Promise<string[]> {
  return await userRepository.getList(userId, "wish");
}

export async function getUserReadlist(userId: Types.ObjectId | string): Promise<string[]> {
  return await userRepository.getList(userId, "read");
}
