import { Types } from "mongoose";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as userReviewService from "../services/userReviewService";
import { userReviewRepository } from "../repositories/userReviewRepository";
import { buildUploadUrl } from "../config/multerConfig";

describe("UserReviewService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
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
    const picturePath = buildUploadUrl("post-image.jpg");

    const result = await userReviewService.createReview(
      userId,
      "id",
      5,
      "text",
      picturePath,
    );

    expect(result).toEqual(review);
    expect(getOrCreateSpy).toHaveBeenCalledWith("id");
    expect(createSpy).toHaveBeenCalledWith({
      user: userId,
      book: bookId,
      rating: 5,
      review: "text",
      picturePath,
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
});
