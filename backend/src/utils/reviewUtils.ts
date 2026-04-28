import { Types, FlattenMaps } from "mongoose";
import { BookDetail } from "@models/ApiBook";
import { PopulatedUserReview } from "@repositories/userReviewRepository";

export type EnrichedUserReview = Omit<PopulatedUserReview, "book"> & {
  book: BookDetail;
};

export type ReviewDocumentLike = PopulatedUserReview & {
  _id: Types.ObjectId;
  toObject?: () => FlattenMaps<PopulatedUserReview>;
};

export const buildUnavailableBook = (bookId: string | null): BookDetail => ({
  id: bookId ?? "unknown",
  title: "Book Unavailable",
  authors: ["Unknown"],
  thumbnail: "",
  description: "Could not load book data.",
  categories: [],
  pageCount: 0,
  previewLink: "",
  genres: [],
});

export const toReviewObject = (
  review: PopulatedUserReview
): FlattenMaps<PopulatedUserReview> | ReviewDocumentLike => {
  const reviewDoc = review as ReviewDocumentLike;
  return typeof reviewDoc.toObject === "function" ? reviewDoc.toObject() : reviewDoc;
};

export const extractObjectIdString = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "object") {
    const typedValue = value as {
      _id?: unknown;
      id?: unknown;
      toString?: () => string;
    };

    if (typedValue._id) {
      return extractObjectIdString(typedValue._id);
    }

    if (typedValue.id) {
      return extractObjectIdString(typedValue.id);
    }

    if (typeof typedValue.toString === "function") {
      const stringified = typedValue.toString();
      if (stringified && stringified !== "[object Object]") {
        return stringified;
      }
    }
  }

  try {
    const stringified = String(value);
    return stringified && stringified !== "[object Object]" ? stringified : null;
  } catch {
    return null;
  }
};

export const requireObjectIdString = (value: unknown, fieldName: string): string => {
  const id = extractObjectIdString(value);
  if (!id) {
    throw new Error(`Could not determine ${fieldName} ID`);
  }

  return id;
};
