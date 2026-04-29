import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";
import type { Book } from "@/models/Book";

export const ListsService = {
  async getWishlistBooks(): Promise<Book[]> {
    const res = await axiosClient.get<Book[]>(endpoints.lists.wishlist);

    return res.data;
  },

  async addBookToWishlist(
    bookId: string,
  ): Promise<Book[]> {
    const res = await axiosClient.post<Book[]>(
      endpoints.lists.addToWishlist(bookId),
    );

    return res.data;
  },

  async removeBookFromWishlist(
    bookId: string,
  ): Promise<Book[]> {
    const res = await axiosClient.delete<Book[]>(
      endpoints.lists.removeFromWishlist(bookId),
    );

    return res.data;
  },
};
