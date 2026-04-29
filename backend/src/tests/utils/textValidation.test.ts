import { describe, expect, it } from "@jest/globals";
import {
  COMMENT_TEXT_MAX_LENGTH,
  RATING_STEP,
  REVIEW_TEXT_MAX_LENGTH,
  SEARCH_QUERY_MAX_LENGTH,
} from "@shared/constants/validation";
import {
  CreateUserReviewSchema,
  ReviewCommentSchema,
} from "@shared/dtos/review.dto";
import {
  validateOptionalTextInput,
  validateTextInput,
} from "../../utils/textValidation";

describe("shared validation limits", () => {
  it("accepts comments up to the shared maximum length", () => {
    const result = ReviewCommentSchema.safeParse({
      user: "507f191e810c19729de860ea",
      comment: "a".repeat(COMMENT_TEXT_MAX_LENGTH),
    });

    expect(result.success).toBe(true);
  });

  it("rejects comments longer than the shared maximum length", () => {
    const result = ReviewCommentSchema.safeParse({
      user: "507f191e810c19729de860ea",
      comment: "a".repeat(COMMENT_TEXT_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
  });

  it("accepts reviews up to the shared maximum length", () => {
    const result = CreateUserReviewSchema.safeParse({
      user: "507f191e810c19729de860ea",
      book: "507f191e810c19729de860eb",
      review: "a".repeat(REVIEW_TEXT_MAX_LENGTH),
      rating: 4.5,
    });

    expect(result.success).toBe(true);
  });

  it("accepts half-step decimal ratings", () => {
    const result = CreateUserReviewSchema.safeParse({
      user: "507f191e810c19729de860ea",
      book: "507f191e810c19729de860eb",
      review: "a".repeat(REVIEW_TEXT_MAX_LENGTH),
      rating: 3.5,
    });

    expect(result.success).toBe(true);
  });

  it("rejects ratings outside the shared rating step", () => {
    const result = CreateUserReviewSchema.safeParse({
      user: "507f191e810c19729de860ea",
      book: "507f191e810c19729de860eb",
      review: "valid review",
      rating: 3.25,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(String(RATING_STEP));
    }
  });

  it("rejects reviews longer than the shared maximum length", () => {
    const result = CreateUserReviewSchema.safeParse({
      user: "507f191e810c19729de860ea",
      book: "507f191e810c19729de860eb",
      review: "a".repeat(REVIEW_TEXT_MAX_LENGTH + 1),
      rating: 4.5,
    });

    expect(result.success).toBe(false);
  });
});

describe("text validation helpers", () => {
  it("rejects non-string values with a field-specific message", () => {
    expect(() =>
      validateTextInput(123, {
        fieldLabel: "Search query",
      })
    ).toThrow("Search query must be a string");
  });

  it("trims and returns normalized text", () => {
    expect(
      validateTextInput("  hello  ", {
        fieldLabel: "Field",
      })
    ).toBe("hello");
  });

  it("rejects required empty values unless empty text is explicitly allowed", () => {
    expect(() =>
      validateTextInput("   ", {
        fieldLabel: "Field",
      })
    ).toThrow("Field is required");

    expect(
      validateTextInput("   ", {
        fieldLabel: "Field",
        allowEmpty: true,
      })
    ).toBe("");
  });

  it("allows optional null and undefined values", () => {
    expect(
      validateOptionalTextInput(undefined, {
        fieldLabel: "Optional field",
      })
    ).toBeUndefined();
    expect(
      validateOptionalTextInput(null, {
        fieldLabel: "Optional field",
      })
    ).toBeUndefined();
  });

  it("applies minimum length only after trimming non-empty values", () => {
    expect(() =>
      validateTextInput(" ab ", {
        fieldLabel: "Field",
        minLength: 3,
      })
    ).toThrow("Field must be at least 3 characters long");
  });

  it("trims and accepts search queries within the shared maximum length", () => {
    const result = validateOptionalTextInput(
      `  ${"a".repeat(SEARCH_QUERY_MAX_LENGTH)}  `,
      {
        fieldLabel: "Search query",
        maxLength: SEARCH_QUERY_MAX_LENGTH,
      }
    );

    expect(result).toBe("a".repeat(SEARCH_QUERY_MAX_LENGTH));
  });

  it("rejects search queries that exceed the shared maximum length", () => {
    expect(() =>
      validateTextInput("a".repeat(SEARCH_QUERY_MAX_LENGTH + 1), {
        fieldLabel: "Search query",
        maxLength: SEARCH_QUERY_MAX_LENGTH,
      })
    ).toThrow("Search query must be at most");
  });
});
