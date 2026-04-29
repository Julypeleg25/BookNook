import { BookModel, IBook } from "@models/Book";
import { Types, FilterQuery } from "mongoose";
import { logger } from "@utils/logger";
import { getBookByGoogleIdFromGoogle, normalizeBookDetail } from "@services/bookService";
import { syncBookToVector } from "@services/ai/vectorSyncService";


interface LocalSearchParams {
  title?: string;
  author?: string;
  minRating?: number;
  minReviews?: number;
  subject?: string;
  page?: number;
  limit?: number;
}

export class BookRepository {
  async findByExternalId(externalId: string): Promise<IBook | null> {
    try {
      return await BookModel.findOne({ externalId });
    } catch (error) {
      logger.error(`Error finding book by externalId ${externalId}:`, error);
      throw error;
    }
  }

  async findById(bookId: Types.ObjectId | string): Promise<IBook | null> {
    try {
      return await BookModel.findById(bookId);
    } catch (error) {
      logger.error(`Error finding book by ID ${bookId}:`, error);
      throw error;
    }
  }

  async create(externalId: string): Promise<IBook> {
    try {
      return await BookModel.create({ externalId });
    } catch (error) {
      logger.error(`Error creating book with externalId ${externalId}:`, error);
      throw error;
    }
  }

  async getOrCreate(externalId: string): Promise<IBook> {
    try {
      const localBook = await this.findByExternalId(externalId);

      const googleBook = await getBookByGoogleIdFromGoogle(externalId);
      const normalizedToBookModel = normalizeBookDetail(googleBook);

      if (localBook) {
        localBook.title = normalizedToBookModel.title;
        localBook.authors = normalizedToBookModel.authors ?? [];
        localBook.thumbnail = normalizedToBookModel.thumbnail;
        localBook.publishedDate = normalizedToBookModel.publishedDate;
        localBook.categories = normalizedToBookModel.categories;
        localBook.description = normalizedToBookModel.description;

        if (!localBook.avgRating && normalizedToBookModel.avgRating) {
          localBook.avgRating = normalizedToBookModel.avgRating;
          localBook.ratingCount = normalizedToBookModel.ratingCount || 0;
        }

        const savedBook = await localBook.save();
        await syncBookToVector(savedBook);
        return savedBook;
      } else {
        const newBook = await BookModel.create({
          externalId,
          title: normalizedToBookModel.title,
          authors: normalizedToBookModel.authors ?? [],
          thumbnail: normalizedToBookModel.thumbnail,
          publishedDate: normalizedToBookModel.publishedDate,
          categories: normalizedToBookModel.categories,
          description: normalizedToBookModel.description,
          avgRating: normalizedToBookModel.avgRating || 0,
          ratingCount: normalizedToBookModel.ratingCount || 0,
        });
        await syncBookToVector(newBook);
        return newBook;
      }
    } catch (error) {
      logger.error(`Error getting or creating book ${externalId}:`, error);
      throw error;
    }
  }

  async updateRating(
    bookId: Types.ObjectId | string,
    avgRating: number,
    ratingCount: number,
    ratingSum: number
  ): Promise<IBook | null> {
    try {
      return await BookModel.findByIdAndUpdate(
        bookId,
        { avgRating, ratingCount, ratingSum },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error updating rating for book ${bookId}:`, error);
      throw error;
    }
  }

  async resetAllRatings(): Promise<number> {
    try {
      const result = await BookModel.updateMany(
        {},
        { $set: { avgRating: 0, ratingCount: 0, ratingSum: 0 } }
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error("Error resetting all book ratings:", error);
      throw error;
    }
  }

  async findByMinRatingAndReviews(
    minRating: number,
    minReviews: number,
    limit = 10
  ): Promise<IBook[]> {
    try {
      return await BookModel.find({
        avgRating: { $gte: minRating },
        ratingCount: { $gte: minReviews },
      })
        .sort({ avgRating: -1, ratingCount: -1 })
        .limit(limit);
    } catch (error) {
      logger.error(
        `Error finding books by minRating=${minRating} minReviews=${minReviews}:`,
        error
      );
      throw error;
    }
  }

  async localSearchBooks({
    title,
    author,
    minRating,
    minReviews,
    subject,
    page = 1,
    limit = 20,
  }: LocalSearchParams): Promise<{ items: IBook[]; total: number }> {
    const filter: FilterQuery<IBook> = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (author) {
      filter.authors = { $regex: author, $options: "i" };
    }

    if (minRating !== undefined) {
      filter.avgRating = { $gte: minRating };
    }

    if (subject) {
      filter.categories = { $elemMatch: { $regex: subject, $options: "i" } };
    }

    if (minReviews !== undefined) {
      filter.ratingCount = { $gte: minReviews };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      BookModel.find(filter)
        .sort({ avgRating: -1, ratingCount: -1 })
        .skip(skip)
        .limit(limit),
      BookModel.countDocuments(filter),
    ]);

    return { items, total };
  }
}

export const bookRepository = new BookRepository();
