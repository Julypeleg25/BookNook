import { Request, Response, NextFunction } from "express";
import { searchBooks, getBookDetails, localSearchBooks } from "@services/bookService";
import { logger } from "@utils/logger";
import { BooksQuery } from "@models/ApiBook";

export const searchBooksHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query as BooksQuery;
    if(query.rating || query.reviewCount){
      const localResult = await localSearchBooks(query)
      return res.json(localResult);

    }
    const result = await searchBooks(query);
    return res.json(result);
  } catch (error) {
    logger.error("Error searching books:", error);
    next(error);
  }
};

export const getBookByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { externalBookId } = req.params;
    if (!externalBookId)
      throw Error(`google book ${externalBookId} doesn't exist`);

    const bookDetail = await getBookDetails(externalBookId);
    res.json({ book: bookDetail });
  } catch (error) {
    logger.error(`Error getting book ${req.params.externalBookId}:`, error);
    next(error);
  }
};
