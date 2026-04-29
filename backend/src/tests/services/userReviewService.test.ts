import { Types } from "mongoose";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as userReviewService from "../../services/userReviewService";
import { userReviewRepository } from "../../repositories/userReviewRepository";
import { userRepository } from "../../repositories/userRepository";
import { bookRepository } from "../../repositories/bookRepository";
import { logger } from "../../utils/logger";

describe("UserReviewService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.spyOn(logger, "warn").mockImplementation(() => {});
  });

  it("creates a review and triggers the related side effects", async () => {
    const userId = new Types.ObjectId();
    const bookId = new Types.ObjectId();
    const review = { _id: new Types.ObjectId(), user: userId };

    const getOrCreateSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "getOrCreateLocalBook")
      .mockResolvedValue({ _id: bookId, thumbnail: "cover.jpg" } as any);
    const createSpy = jest
      .spyOn(userReviewRepository, "create")
      .mockResolvedValue(review as any);
    const recomputeSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "recomputeBookRating")
      .mockResolvedValue(undefined as any);
    const syncReviewSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "syncReviewToVector")
      .mockResolvedValue(undefined as any);
    const syncUserSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "syncUserProfileToVector")
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(userReviewService.userReviewServiceDeps, "findUserById")
      .mockResolvedValue({ _id: userId } as any);

    const result = await userReviewService.createReview(
      userId,
      "id",
      5,
      "text",
      "/uploads/post-image.jpg",
    );

    expect(result).toEqual(review);
    expect(getOrCreateSpy).toHaveBeenCalledWith("id");
    expect(createSpy).toHaveBeenCalledWith({
      user: userId,
      book: bookId,
      rating: 5,
      review: "text",
      picturePath: "/uploads/post-image.jpg",
    });
    expect(recomputeSpy).toHaveBeenCalledWith(bookId.toString());
    expect(syncReviewSpy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: review._id, user: userId }),
    );
    expect(syncUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: userId }),
    );
  });

  it("recomputes rating only when a review rating actually changes", async () => {
    const bookId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const updatedReview = {
      _id: new Types.ObjectId(),
      book: bookId,
      user: userId,
      review: "updated text",
    };

    const updateSpy = jest
      .spyOn(userReviewRepository, "update")
      .mockResolvedValue(updatedReview as any);
    const recomputeSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "recomputeBookRating")
      .mockResolvedValue(undefined as any);
    const syncReviewSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "syncReviewToVector")
      .mockResolvedValue(undefined as any);
    const syncUserSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "syncUserProfileToVector")
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(userReviewService.userReviewServiceDeps, "findUserById")
      .mockResolvedValue({ _id: userId } as any);

    const result = await userReviewService.updateReview("review-id", {
      review: "updated text",
    });

    expect(result).toEqual(updatedReview);
    expect(updateSpy).toHaveBeenCalledWith("review-id", {
      review: "updated text",
    });
    expect(recomputeSpy).not.toHaveBeenCalled();
    expect(syncReviewSpy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: updatedReview._id }),
    );
    expect(syncUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({ _id: userId }),
    );
  });

  it("throws when updating a missing review", async () => {
    jest.spyOn(userReviewRepository, "update").mockResolvedValue(null);

    await expect(
      userReviewService.updateReview("missing-review", { review: "new text" }),
    ).rejects.toThrow("Review not found");
  });

  it("recomputes rating when an updated review changes rating", async () => {
    const bookId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const updatedReview = {
      _id: new Types.ObjectId(),
      book: bookId,
      user: userId,
      rating: 4,
    };

    jest.spyOn(userReviewRepository, "update").mockResolvedValue(updatedReview as any);
    const recomputeSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "recomputeBookRating")
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(userReviewService.userReviewServiceDeps, "syncReviewToVector")
      .mockResolvedValue(undefined as any);
    jest
      .spyOn(userReviewService.userReviewServiceDeps, "findUserById")
      .mockResolvedValue(null);

    await userReviewService.updateReview("review-id", { rating: 4 });

    expect(recomputeSpy).toHaveBeenCalledWith(bookId.toString());
  });

  describe("getAllReviews", () => {
    it("returns an empty list without querying reviews when username has no matches", async () => {
      jest.spyOn(userRepository, "findByUsernamePartial").mockResolvedValue([]);
      const findAllSpy = jest.spyOn(userReviewRepository, "findAll");

      const result = await userReviewService.getAllReviews(undefined, undefined, "missing");

      expect(result).toEqual([]);
      expect(findAllSpy).not.toHaveBeenCalled();
    });

    it("returns an empty list without querying reviews when genre has no local books", async () => {
      jest.spyOn(bookRepository, "localSearchBooks").mockResolvedValue({ items: [], total: 0 });
      const findAllSpy = jest.spyOn(userReviewRepository, "findAll");

      const result = await userReviewService.getAllReviews(
        undefined,
        undefined,
        undefined,
        undefined,
        "Nope",
      );

      expect(result).toEqual([]);
      expect(findAllSpy).not.toHaveBeenCalled();
    });

    it("passes username, title search, rating, and genre filters to the repository", async () => {
      const userId = new Types.ObjectId();
      const genreBookId = new Types.ObjectId();
      const searchBookId = new Types.ObjectId();
      jest
        .spyOn(userRepository, "findByUsernamePartial")
        .mockResolvedValue([{ _id: userId }] as any);
      jest
        .spyOn(bookRepository, "localSearchBooks")
        .mockResolvedValueOnce({ items: [{ _id: genreBookId }], total: 1 } as any)
        .mockResolvedValueOnce({ items: [{ _id: searchBookId }], total: 1 } as any);
      const findAllSpy = jest
        .spyOn(userReviewRepository, "findAll")
        .mockResolvedValue([{ _id: new Types.ObjectId() }] as any);

      const result = await userReviewService.getAllReviews(
        2,
        "Dune",
        "rea",
        4,
        "Sci-Fi",
      );

      expect(result).toHaveLength(1);
      expect(findAllSpy).toHaveBeenCalledWith(
        2,
        "Dune",
        [userId],
        [searchBookId],
        4,
        "Sci-Fi",
        [genreBookId],
      );
    });
  });

  describe("get review helpers", () => {
    it("delegates user and book review list lookups", async () => {
      jest.spyOn(userReviewRepository, "findByUserId").mockResolvedValue(["by-user"] as any);
      jest.spyOn(userReviewRepository, "findByBookId").mockResolvedValue(["by-book"] as any);

      await expect(userReviewService.getReviewsByUserId("user-id")).resolves.toEqual([
        "by-user",
      ]);
      await expect(userReviewService.getReviewsByBookId("book-id")).resolves.toEqual([
        "by-book",
      ]);
    });

    it("throws when a requested review is missing", async () => {
      jest.spyOn(userReviewRepository, "findByIdWithUser").mockResolvedValue(null);

      await expect(userReviewService.getReviewById("missing")).rejects.toThrow(
        "Review not found",
      );
      await expect(userReviewService.getPopulatedReviewById("missing")).rejects.toThrow(
        "Review not found",
      );
    });
  });

  it("reuses book lookups when enriching multiple reviews for the same book", async () => {
    const sharedBookId = new Types.ObjectId();
    const getGoogleBookSpy = jest
      .spyOn(userReviewService.userReviewServiceDeps, "getGoogleBookByLocalId")
      .mockResolvedValue({
        id: "google-book-1",
        volumeInfo: {
          title: "Shared Book",
          authors: ["Author One"],
          categories: ["Fiction"],
        },
      } as any);

    const enrichedReviews = await userReviewService.getEnrichedReviews([
      {
        _id: new Types.ObjectId(),
        book: sharedBookId,
        review: "First",
        rating: 4,
        user: new Types.ObjectId(),
      } as any,
      {
        _id: new Types.ObjectId(),
        book: sharedBookId,
        review: "Second",
        rating: 5,
        user: new Types.ObjectId(),
      } as any,
    ]);

    expect(getGoogleBookSpy).toHaveBeenCalledTimes(1);
    expect(enrichedReviews).toHaveLength(2);
    expect(enrichedReviews[0].book).toEqual(
      expect.objectContaining({
        id: "google-book-1",
        title: "Shared Book",
      }),
    );
    expect(enrichedReviews[1].book).toEqual(
      expect.objectContaining({
        id: "google-book-1",
        title: "Shared Book",
      }),
    );
  });

  it("returns unavailable book data when enriching a review with invalid book data", async () => {
    const reviewId = new Types.ObjectId();

    const [result] = await userReviewService.getEnrichedReviews([
      {
        _id: reviewId,
        book: { broken: true },
        review: "Review",
        rating: 4,
        user: new Types.ObjectId(),
      } as any,
    ]);

    expect(result.book).toEqual(
      expect.objectContaining({
        id: "unknown",
        title: "Book Unavailable",
      }),
    );
  });

  it("enriches a single populated review and falls back when book lookup fails", async () => {
    const reviewId = new Types.ObjectId().toString();
    const bookId = new Types.ObjectId();
    jest.spyOn(userReviewRepository, "findByIdWithUser").mockResolvedValue({
      _id: reviewId,
      book: bookId,
      review: "Review",
      rating: 3,
      user: new Types.ObjectId(),
    } as any);
    jest
      .spyOn(userReviewService.userReviewServiceDeps, "getGoogleBookByLocalId")
      .mockRejectedValue(new Error("google failed"));

    const result = await userReviewService.getPopulatedReviewById(reviewId);

    expect(result.book).toEqual(
      expect.objectContaining({
        id: bookId.toString(),
        title: "Book Unavailable",
      }),
    );
  });

  describe("deleteReview", () => {
    it("throws when deleting a missing review", async () => {
      jest.spyOn(userReviewRepository, "findById").mockResolvedValue(null);

      await expect(userReviewService.deleteReview("missing")).rejects.toThrow(
        "Review not found",
      );
    });

    it("deletes a review and triggers rating/vector/profile side effects", async () => {
      const bookId = new Types.ObjectId();
      const userId = new Types.ObjectId();
      jest.spyOn(userReviewRepository, "findById").mockResolvedValue({
        _id: "review-id",
        book: bookId,
        user: userId,
      } as any);
      const deleteSpy = jest
        .spyOn(userReviewRepository, "delete")
        .mockResolvedValue({ _id: "review-id" } as any);
      const recomputeSpy = jest
        .spyOn(userReviewService.userReviewServiceDeps, "recomputeBookRating")
        .mockResolvedValue(undefined as any);
      const deleteVectorSpy = jest
        .spyOn(userReviewService.userReviewServiceDeps, "deleteReviewFromVector")
        .mockResolvedValue(undefined as any);
      const syncUserSpy = jest
        .spyOn(userReviewService.userReviewServiceDeps, "syncUserProfileToVector")
        .mockResolvedValue(undefined as any);
      jest
        .spyOn(userReviewService.userReviewServiceDeps, "findUserById")
        .mockResolvedValue({ _id: userId } as any);

      await userReviewService.deleteReview("review-id");

      expect(deleteSpy).toHaveBeenCalledWith("review-id");
      expect(recomputeSpy).toHaveBeenCalledWith(bookId.toString());
      expect(deleteVectorSpy).toHaveBeenCalledWith("review-id");
      expect(syncUserSpy).toHaveBeenCalledWith(expect.objectContaining({ _id: userId }));
    });
  });

  describe("isReviewAuthor", () => {
    it("returns false when the review does not exist", async () => {
      jest.spyOn(userReviewRepository, "findById").mockResolvedValue(null);

      await expect(userReviewService.isReviewAuthor("missing", "user-id")).resolves.toBe(
        false,
      );
    });

    it("compares the review user id with the provided user id", async () => {
      const userId = new Types.ObjectId();
      jest.spyOn(userReviewRepository, "findById").mockResolvedValue({
        user: userId,
      } as any);

      await expect(
        userReviewService.isReviewAuthor("review-id", userId.toString()),
      ).resolves.toBe(true);
      await expect(
        userReviewService.isReviewAuthor("review-id", new Types.ObjectId().toString()),
      ).resolves.toBe(false);
    });
  });
});
