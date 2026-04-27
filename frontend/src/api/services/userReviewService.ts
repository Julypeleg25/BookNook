import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

import { UserReview, ReviewComment, CreateReviewData } from "@/models/UserReview";

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

    async getAllReviews(
        minLikes?: number,
        searchQuery?: string,
        username?: string,
        rating?: number,
        genre?: string,
        minComments?: number
    ): Promise<UserReview[]> {
        const res = await axiosClient.get<UserReview[]>(
            endpoints.userReviews.getAll,
            { params: { minLikes, search: searchQuery, username, rating, genre, minComments } }
        );
        return res.data;
    },

    async getReviewById(reviewId: string): Promise<UserReview> {
        const res = await axiosClient.get<UserReview>(
            endpoints.userReviews.getById(reviewId)
        );
        return res.data;
    },

    async deleteReview(reviewId: string): Promise<void> {
        await axiosClient.delete(endpoints.userReviews.delete(reviewId));
    },
    async likeReview(reviewId: string): Promise<{ likes: number }> {
        const res = await axiosClient.post<{ likes: number }>(
            endpoints.userReviews.like(reviewId)
        );
        return res.data;
    },

    async unlikeReview(reviewId: string): Promise<{ likes: number }> {
        const res = await axiosClient.post<{ likes: number }>(
            endpoints.userReviews.unlike(reviewId)
        );
        return res.data;
    },

    async updateReview(reviewId: string, data: Partial<CreateReviewData>): Promise<UserReview> {
        const formData = new FormData();
        if (data.rating !== undefined) formData.append("rating", data.rating.toString());
        if (data.review) formData.append("review", data.review);
        if (data.picture) {
            formData.append("picture", data.picture);
        }

        const res = await axiosClient.patch<UserReview>(
            `${endpoints.userReviews.create}/${reviewId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data;
    },

    async addComment(reviewId: string, comment: string): Promise<ReviewComment[]> {
        const res = await axiosClient.post<ReviewComment[]>(
            endpoints.userReviews.comments(reviewId),
            { comment }
        );
        return res.data;
    },

    async deleteComment(reviewId: string, commentId: string): Promise<ReviewComment[]> {
        const res = await axiosClient.delete<ReviewComment[]>(
            endpoints.userReviews.deleteComment(reviewId, commentId)
        );
        return res.data;
    },
};
