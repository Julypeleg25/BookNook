import type { User } from "./User";
import type { Book } from "./Book";

export interface ReviewAuthor {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export type ReviewCommentUser = (User & { _id?: string }) | string;

export interface ReviewComment {
  _id: string;
  user: ReviewCommentUser;
  comment: string;
  createdAt: string;
}

export interface UserReview {
  _id: string;
  user: ReviewAuthor;
  book: Book | string;
  review: string;
  rating: number;
  picturePath?: string;
  imageUrl?: string;
  likes: string[];
  comments: ReviewComment[];
  createdAt: string;
  updatedAt: string;
}
