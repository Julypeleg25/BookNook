import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

import { Book } from "@/models/Book";
import { CreateReviewData, UserReview } from "./userReviewService";



export const ListsService = {
    async getWishlistBooks(
    ): Promise<Book[]> {
           const res = await axiosClient.get<Book[]>(
              endpoints.lists.wishlist
          )

        return res.data
    },
    async getReadlistBooks(
    ): Promise<Book[]> {
           const res = await axiosClient.get<Book[]>(
              endpoints.lists.readlist
          )

        return res.data
    },

      async addBookToList(
        bookId: string,
        listType: "wish" | "read"
    ): Promise<Book[]> {
           const res = await axiosClient.post<Book[]>(
              endpoints.lists.addBook(bookId),
              { listType }
          )

        return res.data
    },

     async removeBookFromList(
        bookId: string,
        listType: "wish" | "read"
    ): Promise<Book[]> {
           const res = await axiosClient.delete<Book[]>(
              endpoints.lists.removeBook(bookId),
              { data: { listType } }
          )

        return res.data
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
        if (data.rating) formData.append("rating", data.rating.toString());
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

    async addComment(reviewId: string, comment: string): Promise<any[]> {
        const res = await axiosClient.post<any[]>(
            endpoints.userReviews.comments(reviewId),
            { comment }
        );
        return res.data;
    },
};
