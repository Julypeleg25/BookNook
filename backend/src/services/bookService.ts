import {
  BookSummary,
  BookDetail,
  GoogleBooksVolume,
  BooksQuery,
} from "@models/ApiBook";
import { bookRepository } from "@repositories/bookRepository";
import { NotFoundError } from "@utils/errors";
import { IBook } from "@models/Book";
import {
  normalizeBookDetail,
  normalizeBookSummary,
  normalizeLocalBookSummary,
} from "../mappers/book.mapper";
import { getGoogleBookById, searchGoogleBooks } from "./googleBooksClient";

export {
  normalizeBookDetail,
  normalizeBookSummary,
  normalizeLocalBookSummary,
} from "../mappers/book.mapper";

interface PaginatedBooks {
  page: number;
  limit: number;
  items: BookSummary[];
  hasNextPage: boolean;
}

export const searchBooks = async (
  query: BooksQuery,
): Promise<PaginatedBooks> => {
  const { title, author, subject, page = "1", limit = "20" } = query;

  const queryParts: string[] = [];
  if (title) queryParts.push(`intitle:"${title}"`);
  if (author) queryParts.push(`inauthor:"${author}"`);
  if (subject) queryParts.push(`subject:"${subject}"`);

  const q = queryParts.length ? queryParts.join(" ") : '""';

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(Math.max(1, Number(limit)), 40);
  const startIndex = (pageNumber - 1) * limitNumber;

  const fields =
    "items(id,volumeInfo(title,authors,imageLinks/thumbnail,publishedDate)),totalItems";

  const response = await searchGoogleBooks({
    q,
    startIndex,
    maxResults: limitNumber,
    fields,
  });

  const items = response.items?.map(normalizeBookSummary) ?? [];

  return {
    page: pageNumber,
    limit: limitNumber,
    items,
    hasNextPage: items.length === limitNumber,
  };
};

export const localSearchBooks = async (
  query: BooksQuery,
): Promise<PaginatedBooks> => {
  const {
    page = "1",
    limit = "20",
    title,
    author,
    rating,
    reviewCount,
    subject,
  } = query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(Math.max(1, Number(limit)), 40);

  const { items } = await bookRepository.localSearchBooks({
    page: pageNumber,
    limit: limitNumber,
    title,
    author,
    minRating: rating,
    minReviews: reviewCount,
    subject,
  });

  const bookSummaries = items.map(normalizeLocalBookSummary);

  return {
    page: pageNumber,
    limit: limitNumber,
    items: bookSummaries,
    hasNextPage: bookSummaries.length === limitNumber,
  };
};

export const getBookByGoogleIdFromGoogle = async (
  googleId: string,
): Promise<GoogleBooksVolume> => {
  return getGoogleBookById(googleId);
};

export const getLocalBookByGoogleId = async (
  googleId: string,
): Promise<IBook | null> => {
  return await bookRepository.findByExternalId(googleId);
};

export const getLocalBookByLocalId = async (
  localId: string,
): Promise<IBook | null> => {
  return await bookRepository.findById(localId);
};

export const getGoogleBookByLocalId = async (
  localId: string,
): Promise<GoogleBooksVolume> => {
  if (!localId || localId === "[object Object]") {
    throw new Error(`Invalid localId provided: ${localId}`);
  }
  const localBook = await bookRepository.findById(localId);
  if (!localBook) {
    throw new NotFoundError("Book not found");
  }
  return await getBookByGoogleIdFromGoogle(localBook.externalId);
};

export const getBookDetails = async (googleId: string): Promise<BookDetail> => {
  const googleBook = await getBookByGoogleIdFromGoogle(googleId);
  const bookDetail = normalizeBookDetail(googleBook);

  const localBook = await getLocalBookByGoogleId(googleId);
  if (localBook) {
    bookDetail.avgRating = localBook.avgRating;
    bookDetail.ratingCount = localBook.ratingCount;
  }

  return bookDetail;
};

export const getOrCreateLocalBook = async (
  googleId: string,
): Promise<IBook> => {
  return await bookRepository.getOrCreate(googleId);
};
