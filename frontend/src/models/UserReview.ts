import type { User } from "./User";
import type { Book } from "./Book";

export interface ReviewComment {
    _id: string;
    user: User;
    comment: string;
    createdAt: string;
}

export interface UserReview {
    _id: string;
    user: {
        _id: string;
        username: string;
        avatar?: string;
        bio?: string;
    };
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
