import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockAggregateRatingsByBook = jest.fn() as any;
const mockUpdateRating = jest.fn() as any;
const mockLoggerError = jest.fn() as any;

jest.unstable_mockModule("@repositories/userReviewRepository", () => ({
  userReviewRepository: {
    aggregateRatingsByBook: mockAggregateRatingsByBook,
  },
}));

jest.unstable_mockModule("@repositories/bookRepository", () => ({
  bookRepository: {
    updateRating: mockUpdateRating,
  },
}));

jest.unstable_mockModule("@utils/logger", () => ({
  logger: {
    error: mockLoggerError,
  },
}));

const { recomputeBookRating } = await import("../../services/ratingService");

describe("ratingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("recomputes and persists the average rating for books with reviews", async () => {
    mockAggregateRatingsByBook.mockResolvedValue({ totalRating: 13.5, count: 3 });
    mockUpdateRating.mockResolvedValue(undefined);

    await recomputeBookRating("book-id");

    expect(mockAggregateRatingsByBook).toHaveBeenCalledWith("book-id");
    expect(mockUpdateRating).toHaveBeenCalledWith("book-id", 4.5, 3, 13.5);
  });

  it("stores a zero average when the book has no ratings", async () => {
    mockAggregateRatingsByBook.mockResolvedValue({ totalRating: 0, count: 0 });

    await recomputeBookRating("book-id");

    expect(mockUpdateRating).toHaveBeenCalledWith("book-id", 0, 0, 0);
  });

  it("logs and rethrows aggregate failures", async () => {
    const error = new Error("aggregate failed");
    mockAggregateRatingsByBook.mockRejectedValue(error);

    await expect(recomputeBookRating("book-id")).rejects.toThrow("aggregate failed");
    expect(mockUpdateRating).not.toHaveBeenCalled();
    expect(mockLoggerError).toHaveBeenCalledWith(
      "Error recomputing rating for book book-id:",
      error,
    );
  });
});
