import type { GenreOptionsType } from "../components/searchFilters/models/SearchFiltersOptions";
import type { User } from "./User";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  publishedDate: Date;
  genres: GenreOptionsType[];
}

interface BookPost {
  id: string;
  book: Book;
  user: User;
  createdDate: Date;
  description: string;
  rating: number;
  imageUrl: string;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  user: User;
  createdDate: Date;
  content: string;
  bookPost: BookPost;
}

export type { Book, BookPost, Comment };
