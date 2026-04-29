import { Request, Response, NextFunction } from "express";
import {
  addBookToUserWishlist,
  getUserWishlist,
  removeBookFromUserWishlist,
} from "@services/wishlistService";
import { getUserById } from "@services/userService";
import { logger } from "@utils/logger";
import { ValidationError } from "@utils/errors";

export const addBookToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    const { bookId } = req.params;

    if (!bookId) {
      throw new ValidationError("Book ID is required");
    }

    const updatedWishlist = await addBookToUserWishlist(userId, bookId as string);
    res.json(updatedWishlist);
  } catch (error) {
    logger.error("Error adding book to wishlist:", error);
    next(error);
  }
};

export const removeBookFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    const { bookId } = req.params;

    if (!bookId) {
      throw new ValidationError("Book ID is required");
    }

    const updatedWishlist = await removeBookFromUserWishlist(userId, bookId as string);
    res.json(updatedWishlist);
  } catch (error) {
    logger.error("Error removing book from wishlist:", error);
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    await getUserById(userId);

    const fullBooksOfWishlist = await getUserWishlist(userId);

    res.json(fullBooksOfWishlist.filter(Boolean));
  } catch (error) {
    logger.error("Error fetching wishlist:", error);
    next(error);
  }
};

