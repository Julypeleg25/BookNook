import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

export interface CreateReviewData {
    bookId: string;
    rating: number;
    review: string;
    picture?: File;
}

export interface UserReview {
    _id: string;
    user: {
        _id: string;
        username: string;
        avatar?: string;
        bio?: string;
    };
    book: string;
    review: string;
    rating: number;
    picturePath?: string;
    imageUrl?: string;
    likes: string[];
    comments: any[];
    createdAt: string;
    updatedAt: string;
}

export const userReviewService = {
    async createReview(data: CreateReviewData): Promise<UserReview> {
        const formData = new FormData();
        formData.append("bookId", data.bookId);
        formData.append("rating", data.rating.toString());
        formData.append("review", data.review);
        if (data.picture) {
            formData.append("picture", data.picture);
        }

        const res = await axiosClient.post<UserReview>(
            endpoints.userReviews.create,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data;
    },

    async getReviewsByBookId(bookId: string): Promise<UserReview[]> {
        const res = await axiosClient.get<UserReview[]>(
            endpoints.userReviews.byBook(bookId)
        );
        return res.data;
    },

    async getAllReviews(): Promise<UserReview[]> {
        const res = await axiosClient.get<UserReview[]>(
            endpoints.userReviews.getAll
        );
        return res.data;
    },
};
