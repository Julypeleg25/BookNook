import type { Book } from "./Book";

export interface PostFormValues {
  review: string;
  image: File | string;
  rating: number;
}

export interface UpdateReviewFormData {
  id: string;
  review: Partial<PostFormValues>;
}

export interface PostFormLocationState {
  book?: Book;
}
