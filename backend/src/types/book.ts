export interface BookSummary {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string;
}

export interface BookDetail extends BookSummary {
  subtitle?: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  categories: string[];
  previewLink?: string;
  avgRating?: number;
  ratingCount?: number;
}

export interface BooksQuery {
  title?: string;
  author?: string;
  subject?: string;
  page?: string;
  limit?: string;
}

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    previewLink?: string;
  };
}

export interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

