import { axiosClient } from "../axios/axiosClient";
import { endpoints } from "../endpoints";

export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
}

export const booksService = {
  getAll(): Promise<Book[]> {
    return axiosClient.get<Book[]>(endpoints.books.getAll).then((res) => res.data);
  },

  getById(externalBookId: string): Promise<Book> {
    return axiosClient.get<Book>(endpoints.books.byId(externalBookId)).then((res) => res.data);
  },
};
