import axios from "axios";
import {
  BookSummary,
  BookDetail,
  GoogleBooksVolume,
  GoogleBooksResponse,
  BooksQuery,
} from "@models/ApiBook";
import { bookRepository } from "@repositories/bookRepository";
import { NotFoundError } from "@utils/errors";
import { logger } from "@utils/logger";
import { ENV } from "@config/config";
import { IBook } from "@models/Book";

const GOOGLE_BOOKS_API = ENV.GOOGLE_BOOKS_API;
const API_KEY = ENV.GOOGLE_BOOKS_API_KEY;

const normalizeBookSummary = (volume: GoogleBooksVolume): BookSummary => {
  const info = volume.volumeInfo;
  return {
    id: volume.id,
    title: info.title,
    authors: info.authors ?? [],
    thumbnail: info.imageLinks?.thumbnail,
    publishedDate: info.publishedDate,
    // Google Books API typically puts averageRating in volumeInfo if available
    avgRating: (info as any).averageRating,
    ratingCount: (info as any).ratingsCount,
    genres: info.categories ?? [],
  };
};

export const normalizeBookDetail = (volume: GoogleBooksVolume): BookDetail => {
  const info = volume.volumeInfo;
  return {
    id: volume.id,
    title: info.title,
    subtitle: info.subtitle,
    authors: info.authors ?? [],
    categories: info.categories ?? [],
    description: info.description,
    publishedDate: info.publishedDate,
    pageCount: info.pageCount,
    thumbnail: info.imageLinks?.thumbnail,
    previewLink: info.previewLink,
    avgRating: (info as any).averageRating,
    ratingCount: (info as any).ratingsCount,
    genres: info.categories ?? [],
  };
};

const localBookToSummary = (book: IBook): BookSummary => {
  return {
    id: book.externalId,
    title: book.title,
    authors: book.authors,
    thumbnail: book.thumbnail,
    publishedDate: book.publishedDate,
    avgRating: book.avgRating,
    ratingCount: book.ratingCount,
    genres: book.categories,
  };
};

interface PaginatedBooks {
  page: number;
  limit: number;
  items: BookSummary[];
  hasNextPage: boolean;
}

export const searchBooks = async (query: BooksQuery): Promise<PaginatedBooks> => {
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

  const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API, {
    params: {
      q,
      startIndex,
      maxResults: limitNumber,
      fields,
      ...(API_KEY ? { key: API_KEY } : {}),
    },
  });

  const items = response.data.items?.map(normalizeBookSummary) ?? [];

  return {
    page: pageNumber,
    limit: limitNumber,
    items,
    hasNextPage: items.length === limitNumber,
  };
};

export const localSearchBooks = async (
  query: BooksQuery
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

  const bookSummaries = items.map(localBookToSummary);

  return {
    page: pageNumber,
    limit: limitNumber,
    items: bookSummaries,
    hasNextPage: bookSummaries.length === limitNumber,
  };
};

export const getBookByGoogleIdFromGoogle = async (
  googleId: string
): Promise<GoogleBooksVolume> => {
  try {
    const response = await axios.get<GoogleBooksVolume>(
      `${GOOGLE_BOOKS_API}/${googleId}`,
      {
        params: API_KEY ? { key: API_KEY } : undefined,
      }
    );
    return response.data;
  } catch (error) {
    logger.error(
      `Error fetching book ${googleId} from Google Books API:`,
      error
    );
    throw new NotFoundError("Book not found in Google Books");
  }
};

export const getLocalBookByGoogleId = async (
  googleId: string
): Promise<IBook | null> => {
  return await bookRepository.findByExternalId(googleId);
};

export const getLocalBookByLocalId = async (
  localId: string
): Promise<IBook | null> => {
  return await bookRepository.findById(localId);
};

export const getGoogleBookByLocalId = async (
  localId: string
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

export const getOrCreateLocalBook = async (googleId: string): Promise<IBook> => {
  return await bookRepository.getOrCreate(googleId);
};
