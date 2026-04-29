import { Types } from "mongoose";
import { describe, expect, it } from "@jest/globals";
import {
  buildUnavailableBook,
  extractObjectIdString,
  requireObjectIdString,
  toReviewObject,
} from "../../utils/reviewUtils";

describe("reviewUtils", () => {
  it("builds a stable unavailable-book fallback", () => {
    expect(buildUnavailableBook(null)).toEqual(
      expect.objectContaining({
        id: "unknown",
        title: "Book Unavailable",
        authors: ["Unknown"],
        categories: [],
        genres: [],
      }),
    );
    expect(buildUnavailableBook("book-id").id).toBe("book-id");
  });

  it("uses toObject when a review document provides it", () => {
    const objectValue = { _id: new Types.ObjectId(), review: "plain" };
    const review = {
      toObject: () => objectValue,
    };

    expect(toReviewObject(review as never)).toBe(objectValue);
  });

  it("returns the original review when no toObject function exists", () => {
    const review = { _id: new Types.ObjectId(), review: "plain" };

    expect(toReviewObject(review as never)).toBe(review);
  });

  it("extracts ids from strings, ObjectIds, nested _id/id values, and custom toString values", () => {
    const objectId = new Types.ObjectId();
    const nestedId = new Types.ObjectId();

    expect(extractObjectIdString("abc")).toBe("abc");
    expect(extractObjectIdString(objectId)).toBe(objectId.toString());
    expect(extractObjectIdString({ _id: nestedId })).toBe(nestedId.toString());
    expect(extractObjectIdString({ id: "from-id" })).toBe("from-id");
    expect(extractObjectIdString({ toString: () => "custom-id" })).toBe("custom-id");
  });

  it("returns null for missing or unusable id values", () => {
    expect(extractObjectIdString(undefined)).toBeNull();
    expect(extractObjectIdString(null)).toBeNull();
    expect(extractObjectIdString({})).toBeNull();
    expect(extractObjectIdString({ toString: () => "[object Object]" })).toBeNull();
  });

  it("throws a field-specific error when an id is required but unavailable", () => {
    expect(requireObjectIdString("id", "book")).toBe("id");
    expect(() => requireObjectIdString({}, "book")).toThrow(
      "Could not determine book ID",
    );
  });
});
