import type { Book } from "@/models/Book";

export const getBookId = (book: Book): string => book.id || book._id || "";
