import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";
import type { Book } from "@/models/Book";
import type { BookListType } from "@/models/List";

export const ListsService = {
  async getWishlistBooks(): Promise<Book[]> {
    const res = await axiosClient.get<Book[]>(endpoints.lists.wishlist);

    return res.data;
  },

  async getReadlistBooks(): Promise<Book[]> {
    const res = await axiosClient.get<Book[]>(endpoints.lists.readlist);

    return res.data;
  },

  async addBookToList(
    bookId: string,
    listType: BookListType,
  ): Promise<Book[]> {
    const res = await axiosClient.post<Book[]>(
      endpoints.lists.addBook(bookId),
      { listType },
    );

    return res.data;
  },

  async removeBookFromList(
    bookId: string,
    listType: BookListType,
  ): Promise<Book[]> {
    const res = await axiosClient.delete<Book[]>(
      endpoints.lists.removeBook(bookId),
      { data: { listType } },
    );

    return res.data;
  },
};
