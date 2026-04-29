import { describe, expect, it } from "@jest/globals";
import {
  RATING_MAX,
  RATING_MIN,
  RATING_STEP,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
  SEARCH_QUERY_MAX_LENGTH,
} from "@shared/constants/validation";
import { ValidationError } from "@utils/errors";
import {
  parseGetAllReviewsQuery,
  parseRating,
  validateOptionalReviewText,
  validateReviewText,
} from "../../validators/userReview.validators";

describe("userReview validators", () => {
  it("accepts ratings inside the shared range and configured step", () => {
    expect(parseRating(RATING_MIN)).toBe(RATING_MIN);
    expect(parseRating(RATING_STEP)).toBe(RATING_STEP);
    expect(parseRating(String(RATING_MAX))).toBe(RATING_MAX);
  });

  it("rejects ratings outside the allowed step or range", () => {
    expect(() => parseRating(RATING_MIN - RATING_STEP)).toThrow(ValidationError);
    expect(() => parseRating(RATING_MAX + RATING_STEP)).toThrow(ValidationError);
    expect(() => parseRating(3.25)).toThrow(`between ${RATING_MIN} and ${RATING_MAX}`);
    expect(() => parseRating("not-a-number")).toThrow(ValidationError);
    expect(() => parseRating(Number.POSITIVE_INFINITY)).toThrow(ValidationError);
  });

  it("trims and validates required review text", () => {
    const validReview = "a".repeat(REVIEW_TEXT_MIN_LENGTH);

    expect(validateReviewText(`  ${validReview}  `)).toBe(validReview);
    expect(() => validateReviewText("a".repeat(REVIEW_TEXT_MIN_LENGTH - 1))).toThrow(
      "Review must be at least",
    );
    expect(() => validateReviewText("a".repeat(REVIEW_TEXT_MAX_LENGTH + 1))).toThrow(
      "Review must be at most",
    );
    expect(() => validateReviewText(123)).toThrow("Review must be a string");
  });

  it("allows missing optional review text and validates provided text", () => {
    const validReview = "a".repeat(REVIEW_TEXT_MIN_LENGTH);

    expect(validateOptionalReviewText(undefined)).toBeUndefined();
    expect(validateOptionalReviewText(null)).toBeUndefined();
    expect(validateOptionalReviewText(` ${validReview} `)).toBe(validReview);
    expect(() => validateOptionalReviewText("a".repeat(REVIEW_TEXT_MIN_LENGTH - 1))).toThrow(
      "Review must be at least",
    );
  });

  it("normalizes supported get-all review query params", () => {
    const search = "a".repeat(SEARCH_QUERY_MAX_LENGTH);

    expect(
      parseGetAllReviewsQuery({
        minLikes: "3",
        search: `  ${search}  `,
        username: "reader",
        rating: "4.5",
        genre: "Fantasy",
      }),
    ).toEqual({
      minLikes: 3,
      searchQuery: search,
      username: "reader",
      rating: 4.5,
      genre: "Fantasy",
    });
  });

  it("omits absent or blank get-all review query params", () => {
    expect(parseGetAllReviewsQuery({ search: "   " })).toEqual({
      minLikes: undefined,
      searchQuery: undefined,
      username: undefined,
      rating: undefined,
      genre: undefined,
    });
  });

  it("rejects overlong search query params with a specific message", () => {
    expect(() =>
      parseGetAllReviewsQuery({
        search: "a".repeat(SEARCH_QUERY_MAX_LENGTH + 1),
      })
    ).toThrow("Search query must be at most");
  });
});
