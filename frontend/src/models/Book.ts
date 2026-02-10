import type { GenreOptionsType } from "@components/searchFilters/models/SearchFiltersOptions";
import type { User } from "./User";

interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  thumbnail?: string;
  publishedDate?: string;
  genres?: GenreOptionsType[];
  pageCount?: number;
  categories?: string[];
  subtitle?: string;
  previewLink?: string;
  avgRating?: number;
  ratingCount?: number;
}

interface BookPost {
  id: string;
  book: Book;
  user: User;
  createdDate: string;
  description: string;
  rating: number;
  imageUrl?: string;
  likes: string[]; // Updated to string[] (user IDs)
  comments: PostComment[];
}

interface PostComment {
  id: string;
  user: User;
  createdDate: string;
  content: string;
  bookPost?: BookPost;
}

export type { Book, BookPost, PostComment };
