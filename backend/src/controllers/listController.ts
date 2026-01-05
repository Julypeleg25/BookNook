import { Request, Response, NextFunction } from "express";
import {
  addBookToUserList,
  getUserWishlist,
  getUserReadlist,
} from "@services/listService";
import { getBookByGoogleIdFromGoogle } from "@services/bookService";
import { getUserById } from "@services/userService";
import { logger } from "@utils/logger";

export const addBookToList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.authenticatedUser!._id;
    const { bookId } = req.params;
    const { listType } = req.body;

    if (!listType || (listType !== "wish" && listType !== "read")) {
      return res
        .status(400)
        .json({ error: "Invalid list type. Must be 'wish' or 'read'" });
    }

    if (!bookId) throw Error(`book ${bookId} doesn't exist`);

    const updatedList = await addBookToUserList(userId, bookId, listType);
    res.json({ updatedList });
  } catch (error) {
    logger.error("Error adding book to list:", error);
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.authenticatedUser!._id;
    const user = await getUserById(userId);

    const fullBooksOfWishlist = await Promise.all(
      user.wishlist.map(async (bookId) => {
        try {
          const bookData = await getBookByGoogleIdFromGoogle(bookId.toString());
          return bookData;
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
) => {
  try {
    const userId = req.authenticatedUser!._id;
    const user = await getUserById(userId);

    const fullBooksOfReadlist = await Promise.all(
      user.readlist.map(async (bookId) => {
        try {
          const bookData = await getBookByGoogleIdFromGoogle(bookId);
          return bookData;
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
