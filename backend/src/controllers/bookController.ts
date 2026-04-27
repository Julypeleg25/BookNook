import { Request, Response, NextFunction } from "express";
import { searchBooks, getBookDetails, localSearchBooks } from "@services/bookService";
import { logger } from "@utils/logger";
import { BooksQuery } from "@models/ApiBook";
import { ValidationError } from "@utils/errors";

export const searchBooksHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query: BooksQuery = {
      title: typeof req.query.title === "string" ? req.query.title : undefined,
      author: typeof req.query.author === "string" ? req.query.author : undefined,
      subject: typeof req.query.subject === "string" ? req.query.subject : undefined,
      page: typeof req.query.page === "string" ? req.query.page : undefined,
      limit: typeof req.query.limit === "string" ? req.query.limit : undefined,
      rating: typeof req.query.rating === "string" ? Number(req.query.rating) : undefined,
      reviewCount: typeof req.query.reviewCount === "string" ? Number(req.query.reviewCount) : undefined,
    };

    if (query.rating !== undefined && (isNaN(query.rating) || query.rating < 0 || query.rating > 5)) {
      throw new ValidationError("Rating must be a number between 0 and 5");
    }

    if (query.reviewCount !== undefined && (isNaN(query.reviewCount) || query.reviewCount < 0)) {
      throw new ValidationError("Review count must be a non-negative number");
    }

    if (query.rating !== undefined || query.reviewCount !== undefined) {
      const localResult = await localSearchBooks(query);
      res.json(localResult);
      return;
    }

    const result = await searchBooks(query);
    res.json(result);
  } catch (error: unknown) {
    logger.error("Error searching books:", error);
    next(error);
  }
};

export const getBookByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { externalBookId } = req.params;
    if (!externalBookId) {
      throw new ValidationError("Book ID is required");
    }

    const bookDetail = await getBookDetails(externalBookId as string);
    res.json({ book: bookDetail });
  } catch (error: unknown) {
    logger.error(`Error getting book ${req.params.externalBookId}:`, error);
    next(error);
  }
};
