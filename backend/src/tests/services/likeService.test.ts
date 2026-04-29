import { Types } from "mongoose";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockFindReviewById = jest.fn() as any;
const mockAddLike = jest.fn() as any;
const mockRemoveLike = jest.fn() as any;
const mockFindUserById = jest.fn() as any;
const mockSyncUserProfileToVector = jest.fn() as any;
const mockLoggerWarn = jest.fn() as any;

jest.unstable_mockModule("@repositories/userReviewRepository", () => ({
  userReviewRepository: {
    findById: mockFindReviewById,
    addLike: mockAddLike,
    removeLike: mockRemoveLike,
  },
}));

jest.unstable_mockModule("@repositories/userRepository", () => ({
  userRepository: {
    findById: mockFindUserById,
  },
}));

jest.unstable_mockModule("@services/ai/vectorSyncService", () => ({
  syncUserProfileToVector: mockSyncUserProfileToVector,
}));

jest.unstable_mockModule("@utils/logger", () => ({
  logger: {
    warn: mockLoggerWarn,
  },
}));

const { likeReview, unlikeReview } = await import("../../services/likeService");

const flushPromises = async (): Promise<void> => {
  await new Promise((resolve) => setImmediate(resolve));
};

describe("likeService", () => {
  const reviewId = new Types.ObjectId().toString();
  const authorId = new Types.ObjectId();
  const userId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("likeReview", () => {
    it("likes a review and returns the updated like count", async () => {
      const user = { _id: userId };
      mockFindReviewById.mockResolvedValue({ _id: reviewId, user: authorId });
      mockAddLike.mockResolvedValue({ likes: [userId, new Types.ObjectId()] });
      mockFindUserById.mockResolvedValue(user);
      mockSyncUserProfileToVector.mockResolvedValue(undefined);

      const result = await likeReview(reviewId, userId);
      await flushPromises();

      expect(result).toBe(2);
      expect(mockFindReviewById).toHaveBeenCalledWith(reviewId);
      expect(mockAddLike).toHaveBeenCalledWith(reviewId, userId);
      expect(mockSyncUserProfileToVector).toHaveBeenCalledWith(user);
    });

    it("throws when the review does not exist", async () => {
      mockFindReviewById.mockResolvedValue(null);

      await expect(likeReview(reviewId, userId)).rejects.toThrow("Review not found");
      expect(mockAddLike).not.toHaveBeenCalled();
    });

    it("prevents users from liking their own review", async () => {
      mockFindReviewById.mockResolvedValue({ _id: reviewId, user: userId });

      await expect(likeReview(reviewId, userId)).rejects.toThrow(
        "You can't like your own review",
      );
      expect(mockAddLike).not.toHaveBeenCalled();
    });

    it("throws when the update cannot find the review", async () => {
      mockFindReviewById.mockResolvedValue({ _id: reviewId, user: authorId });
      mockAddLike.mockResolvedValue(null);

      await expect(likeReview(reviewId, userId)).rejects.toThrow("Review not found");
    });

    it("does not fail the like when profile sync fails", async () => {
      mockFindReviewById.mockResolvedValue({ _id: reviewId, user: authorId });
      mockAddLike.mockResolvedValue({ likes: [userId] });
      mockFindUserById.mockResolvedValue({ _id: userId });
      mockSyncUserProfileToVector.mockRejectedValue(new Error("sync failed"));

      await expect(likeReview(reviewId, userId)).resolves.toBe(1);
      await flushPromises();

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        expect.stringContaining("Failed to sync profile after like state changed"),
        expect.any(Error),
      );
    });
  });

  describe("unlikeReview", () => {
    it("unlikes a review and returns the updated like count", async () => {
      mockFindReviewById.mockResolvedValue({ _id: reviewId, user: authorId });
      mockRemoveLike.mockResolvedValue({ likes: [] });
      mockFindUserById.mockResolvedValue({ _id: userId });
      mockSyncUserProfileToVector.mockResolvedValue(undefined);

      await expect(unlikeReview(reviewId, userId)).resolves.toBe(0);
      expect(mockRemoveLike).toHaveBeenCalledWith(reviewId, userId);
    });

    it("throws when unliking a missing review", async () => {
      mockFindReviewById.mockResolvedValue(null);

      await expect(unlikeReview(reviewId, userId)).rejects.toThrow("Review not found");
      expect(mockRemoveLike).not.toHaveBeenCalled();
    });

    it("throws when the unlike update cannot find the review", async () => {
      mockFindReviewById.mockResolvedValue({ _id: reviewId, user: authorId });
      mockRemoveLike.mockResolvedValue(null);

      await expect(unlikeReview(reviewId, userId)).rejects.toThrow("Review not found");
    });
  });
});
