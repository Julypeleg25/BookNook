import { Types } from "mongoose";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockFindById = jest.fn() as any;
const mockFindByIdAndUpdate = jest.fn() as any;

jest.unstable_mockModule("@models/UserReview", () => ({
  UserReviewModel: {
    findById: mockFindById,
    findByIdAndUpdate: mockFindByIdAndUpdate,
  },
}));

const { addComment, deleteComment } = await import("../../services/commentService");

describe("commentService", () => {
  const reviewId = new Types.ObjectId().toString();
  const commentId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId();
  const reviewAuthorId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addComment", () => {
    it("adds a comment and returns populated comments", async () => {
      const comments = [{ user: userId, comment: "Nice review" }];
      const populate = (jest.fn() as any).mockResolvedValue({ comments });
      mockFindById.mockResolvedValue({ _id: reviewId });
      mockFindByIdAndUpdate.mockReturnValue({ populate });

      const result = await addComment(reviewId, userId, "Nice review");

      expect(result).toBe(comments);
      expect(mockFindById).toHaveBeenCalledWith(reviewId);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        reviewId,
        {
          $push: {
            comments: {
              user: userId,
              comment: "Nice review",
              createdAt: expect.any(Date),
            },
          },
        },
        { new: true },
      );
      expect(populate).toHaveBeenCalledWith("comments.user", "username avatar");
    });

    it("throws when the target review does not exist", async () => {
      mockFindById.mockResolvedValue(null);

      await expect(addComment(reviewId, userId, "Nice review")).rejects.toThrow(
        "Review not found",
      );

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns an empty array when the update unexpectedly returns null", async () => {
      const populate = (jest.fn() as any).mockResolvedValue(null);
      mockFindById.mockResolvedValue({ _id: reviewId });
      mockFindByIdAndUpdate.mockReturnValue({ populate });

      await expect(addComment(reviewId, userId, "Nice review")).resolves.toEqual([]);
    });
  });

  describe("deleteComment", () => {
    it("deletes a comment when requested by the comment author", async () => {
      const comments = [{ _id: commentId, user: userId }];
      mockFindById.mockResolvedValue({
        _id: reviewId,
        user: reviewAuthorId,
        comments,
      });
      mockFindByIdAndUpdate.mockResolvedValue({ comments: [] });

      const result = await deleteComment(reviewId, commentId, userId.toString());

      expect(result).toEqual([]);
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        reviewId,
        {
          $pull: {
            comments: { _id: commentId },
          },
        },
        { new: true },
      );
    });

    it("deletes a comment when requested by the review author", async () => {
      mockFindById.mockResolvedValue({
        _id: reviewId,
        user: reviewAuthorId,
        comments: [{ _id: commentId, user: userId }],
      });
      mockFindByIdAndUpdate.mockResolvedValue({ comments: [{ _id: "other" }] });

      const result = await deleteComment(reviewId, commentId, reviewAuthorId.toString());

      expect(result).toEqual([{ _id: "other" }]);
    });

    it("throws when deleting from a missing review", async () => {
      mockFindById.mockResolvedValue(null);

      await expect(deleteComment(reviewId, commentId, userId.toString())).rejects.toThrow(
        "Review not found",
      );
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("throws when the comment is missing", async () => {
      mockFindById.mockResolvedValue({
        _id: reviewId,
        user: reviewAuthorId,
        comments: [],
      });

      await expect(deleteComment(reviewId, commentId, userId.toString())).rejects.toThrow(
        "Comment not found",
      );
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("throws when the requester is neither comment author nor review author", async () => {
      mockFindById.mockResolvedValue({
        _id: reviewId,
        user: reviewAuthorId,
        comments: [{ _id: commentId, user: userId }],
      });

      await expect(
        deleteComment(reviewId, commentId, new Types.ObjectId().toString()),
      ).rejects.toThrow("Not authorized to delete this comment");
      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("returns an empty array when the delete update unexpectedly returns null", async () => {
      mockFindById.mockResolvedValue({
        _id: reviewId,
        user: reviewAuthorId,
        comments: [{ _id: commentId, user: userId }],
      });
      mockFindByIdAndUpdate.mockResolvedValue(null);

      await expect(deleteComment(reviewId, commentId, userId.toString())).resolves.toEqual([]);
    });
  });
});
