import { Request, Response, NextFunction } from "express";
import { addBookToUserList, removeBookFromUserList } from "@services/listService";
import { getBookByGoogleIdFromGoogle } from "@services/bookService";
import { getUserById } from "@services/userService";
import { logger } from "@utils/logger";
import { ValidationError } from "@utils/errors";

type ListType = "wish" | "read";

const isValidListType = (value: unknown): value is ListType => {
  return value === "wish" || value === "read";
};

export const addBookToList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    const { bookId } = req.params;
    const { listType } = req.body;

    if (!isValidListType(listType)) {
      throw new ValidationError("Invalid list type. Must be 'wish' or 'read'");
    }

    if (!bookId) {
      throw new ValidationError("Book ID is required");
    }

    const updatedList = await addBookToUserList(userId, bookId, listType);
    res.json({ updatedList });
  } catch (error) {
    logger.error("Error adding book to list:", error);
    next(error);
  }
};

export const removeBookFromList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    const { bookId } = req.params;
    const { listType } = req.body;  

    if (!isValidListType(listType)) {
      throw new ValidationError("Invalid list type. Must be 'wish' or 'read'");
    }

    const updatedList = await removeBookFromUserList(userId, bookId, listType);
    res.json({ updatedList });
  } catch (error) {
    logger.error("Error removing book from list:", error);
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    const user = await getUserById(userId);

    const fullBooksOfWishlist = await Promise.all(
      user.wishlist.map(async (bookId) => {
        try {
          return await getBookByGoogleIdFromGoogle(bookId.toString());
        } catch (error) {
          logger.warn(`Error fetching book ${bookId} for wishlist:`, error);
          return null;
        }
      })
    );

    res.json(fullBooksOfWishlist.filter(Boolean));
  } catch (error) {
    logger.error("Error fetching wishlist:", error);
    next(error);
  }
};

export const getReadlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    const user = await getUserById(userId);

    const fullBooksOfReadlist = await Promise.all(
      user.readlist.map(async (bookId) => {
        try {
          return await getBookByGoogleIdFromGoogle(bookId.toString());
        } catch (error) {
          logger.warn(`Error fetching book ${bookId} for readlist:`, error);
          return null;
        }
      })
    );

    res.json(fullBooksOfReadlist.filter(Boolean));
  } catch (error) {
    logger.error("Error fetching readlist:", error);
    next(error);
  }
};
