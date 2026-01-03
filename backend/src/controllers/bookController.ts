import { Request, Response, NextFunction } from "express";
import { BooksQuery } from "../types/book";
import { searchBooks, getBookDetails } from "../services/bookService";
import { logger } from "../utils/logger";

export const searchBooksHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as BooksQuery;
    const result = await searchBooks(query);
    res.json(result);
  } catch (error) {
    logger.error("Error searching books:", error);
    next(error);
  }
};

export const getBookByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { externalBookId } = req.params;
    const bookDetail = await getBookDetails(externalBookId);
    res.json({ book: bookDetail });
  } catch (error) {
    logger.error(`Error getting book ${req.params.externalBookId}:`, error);
    next(error);
  }
};
