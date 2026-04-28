import type { BookDetail, BookSummary, GoogleBooksVolume } from "@models/ApiBook";
import type { IBook } from "@models/Book";

interface GoogleBooksRatingInfo {
  averageRating?: number;
  ratingsCount?: number;
}

export const normalizeBookSummary = (volume: GoogleBooksVolume): BookSummary => {
  const info = volume.volumeInfo;
  const ratingInfo = info as GoogleBooksRatingInfo & typeof info;

  return {
    id: volume.id,
    title: info.title,
    authors: info.authors ?? [],
    thumbnail: info.imageLinks?.thumbnail,
    publishedDate: info.publishedDate,
    avgRating: ratingInfo.averageRating,
    ratingCount: ratingInfo.ratingsCount,
    genres: info.categories ?? [],
  };
};

export const normalizeBookDetail = (volume: GoogleBooksVolume): BookDetail => {
  const info = volume.volumeInfo;
  const ratingInfo = info as GoogleBooksRatingInfo & typeof info;

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
    avgRating: ratingInfo.averageRating,
    ratingCount: ratingInfo.ratingsCount,
    genres: info.categories ?? [],
  };
};

export const normalizeLocalBookSummary = (book: IBook): BookSummary => {
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
