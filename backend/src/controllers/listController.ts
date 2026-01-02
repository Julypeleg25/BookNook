import { Request, Response } from "express";
import User from "../models/User";
import  { IBook } from "../models/Book";
import { Types } from "mongoose";
import { BookSummary } from "../routes/books";

export const addBookToUserList = async (
  userId: Types.ObjectId,
  bookId: string,
  listType: 'wish' | 'read'
): Promise<string[]> => {
  try {

    if (listType === 'read') {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { readlist: bookId } },
        { new: true }
      )


      return updatedUser?.readlist || [];
    }

    if (listType === 'wish') {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $addToSet: { wishlist: bookId } },
          { new: true }
        )


        return updatedUser?.wishlist || [];
      }

    throw new Error("Invalid list type");
  } catch (error) {
    throw new Error("Failed to add book to list");
  }
};
