import { BookModel, IBook } from "@models/Book";
import { Types } from "mongoose";
import { logger } from "@utils/logger";

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
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error(`Error updating rating for book ${bookId}:`, error);
      throw error;
    }
  }

  async getOrCreate(externalId: string): Promise<IBook> {
    try {
      let book = await this.findByExternalId(externalId);
      if (!book) {
        book = await this.create(externalId);
      }
      return book;
    } catch (error) {
      logger.error(`Error getting or creating book ${externalId}:`, error);
      throw error;
    }
  }
}

export const bookRepository = new BookRepository();

