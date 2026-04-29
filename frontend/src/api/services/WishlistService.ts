import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";
import type { Book } from "@/models/Book";

export const WishlistService = {
  async getWishlistBooks(): Promise<Book[]> {
    const res = await axiosClient.get<Book[]>(endpoints.wishlist.wishlist);

    return res.data;
  },

  async addBookToWishlist(
    bookId: string,
  ): Promise<Book[]> {
    const res = await axiosClient.post<Book[]>(
      endpoints.wishlist.addToWishlist(bookId),
    );

    return res.data;
  },

  async removeBookFromWishlist(
    bookId: string,
  ): Promise<Book[]> {
    const res = await axiosClient.delete<Book[]>(
      endpoints.wishlist.removeFromWishlist(bookId),
    );

    return res.data;
  },
};
