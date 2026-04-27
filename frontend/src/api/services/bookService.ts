import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

export interface BookSummary {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  publishedDate?: string;
  avgRating?: number;
  ratingCount?: number;
}

export interface BookDetail extends BookSummary {
  subtitle?: string;
  description?: string;
  pageCount?: number;
  categories: string[];
  previewLink?: string;
  avgRating?: number;
  ratingCount?: number;
}

export interface BooksSearchParams {
  title?: string;
  author?: string;
  subject?: string;
  page?: number;
  limit?: number;
  rating?: number;
  reviewCount?: number;
}

interface PaginatedBooksResponse {
  page: number;
  limit: number;
  items: BookSummary[];
  hasNextPage: boolean;
}

export const booksService = {
  async search(params: BooksSearchParams): Promise<PaginatedBooksResponse> {
    const res = await axiosClient.get<PaginatedBooksResponse>(
      endpoints.books.search,
      { params }
    );
    return res.data;
  },

  async getById(externalBookId: string): Promise<{ book: BookDetail }> {
    const res = await axiosClient.get<{ book: BookDetail }>(
      endpoints.books.byId(externalBookId)
    );
    return res.data;
  },
};
