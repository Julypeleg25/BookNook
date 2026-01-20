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

const GOOGLE_BOOKS_API = ENV.GOOGLE_BOOKS_API;
const API_KEY = ENV.GOOGLE_BOOKS_API_KEY;

function normalizeBookSummary(volume: GoogleBooksVolume): BookSummary {
  const info = volume.volumeInfo;
  return {
    id: volume.id,
    title: info.title,
    authors: info.authors ?? [],
    thumbnail: info.imageLinks?.thumbnail,
    publishedDate:info.publishedDate
  };
}

function normalizeBookDetail(volume: GoogleBooksVolume): BookDetail {
  const info = volume.volumeInfo;
  return {
    id: volume.id,
    title: info.title,
    subtitle: info.subtitle,
    authors: info.authors ?? [],
    description: info.description,
    publishedDate: info.publishedDate,
    pageCount: info.pageCount,
    categories: info.categories ?? [],
    thumbnail: info.imageLinks?.thumbnail,
    previewLink: info.previewLink,
  };
}

export async function searchBooks(query: BooksQuery): Promise<{
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  items: BookSummary[];
}> {
  try {
    const { title, author, subject, page = 1, limit = 20 } = query;

    const queryParts: string[] = [];
    if (title) queryParts.push(`intitle:"${title}"`);
    if (author) queryParts.push(`inauthor:"${author}"`);
    if (subject) queryParts.push(`subject:"${subject}"`);

    const q = queryParts.length ? queryParts.join("+") : '""';

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(Math.max(1, Number(limit)), 40); 
    const startIndex = (pageNumber - 1) * limitNumber;

    const fields = "items(id,volumeInfo(title,authors,imageLinks/thumbnail,publishedDate)),totalItems";

    const response = await axios.get<GoogleBooksResponse>(GOOGLE_BOOKS_API, {
      params: {
        q,
        startIndex,
        maxResults: limitNumber,
        fields,
        key: API_KEY, 
      },
    });

    const data = response.data;
    const totalItems = data.totalItems ?? 0;

    return {
      page: pageNumber,
      limit: limitNumber,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / limitNumber),
      items: data.items?.map(normalizeBookSummary) ?? [],
    };
  } catch (error) {
    logger.error("Error searching books:", error);
    throw error;
  }
}
export async function getBookByGoogleIdFromGoogle(
  googleId: string
): Promise<GoogleBooksVolume> {
  try {
    const response = await axios.get<GoogleBooksVolume>(
      `${GOOGLE_BOOKS_API}/${googleId}`
    );
    return response.data;
  } catch (error) {
    logger.error(
      `Error fetching book ${googleId} from Google Books API:`,
      error
    );
    throw new NotFoundError("Book not found in Google Books");
  }
}

export async function getLocalBookByGoogleId(googleId: string) {
  return await bookRepository.findByExternalId(googleId);
}

export async function getLocalBookByLocalId(localId: string) {
  return await bookRepository.findById(localId);
}

export async function getGoogleBookByLocalId(
  localId: string
): Promise<GoogleBooksVolume> {
  const localBook = await bookRepository.findById(localId);
  if (!localBook) {
    throw new NotFoundError("Book not found");
  }
  return await getBookByGoogleIdFromGoogle(localBook.externalId);
}

export async function getBookDetails(googleId: string): Promise<BookDetail> {
  try {
    const googleBook = await getBookByGoogleIdFromGoogle(googleId);
    const bookDetail = normalizeBookDetail(googleBook);

    const localBook = await getLocalBookByGoogleId(googleId);
    if (localBook) {
      bookDetail.avgRating = localBook.avgRating;
      bookDetail.ratingCount = localBook.ratingCount;
    }

    return bookDetail;
  } catch (error) {
    logger.error(`Error getting book details for ${googleId}:`, error);
    throw error;
  }
}

export async function getOrCreateLocalBook(googleId: string) {
  return await bookRepository.getOrCreate(googleId);
}
