import express, { type NextFunction, type Request, type Response } from "express";
import request from "supertest";
import { Types } from "mongoose";
import { jest } from "@jest/globals";

const mockCreateReview = jest.fn() as any;
const mockDeleteReview = jest.fn() as any;
const mockGetAllReviews = jest.fn() as any;
const mockGetEnrichedReviews = jest.fn() as any;
const mockGetPopulatedReviewById = jest.fn() as any;
const mockGetReviewsByBookId = jest.fn() as any;
const mockGetReviewsByUserId = jest.fn() as any;
const mockIsReviewAuthor = jest.fn() as any;
const mockUpdateReview = jest.fn() as any;
const mockLikeReview = jest.fn() as any;
const mockUnlikeReview = jest.fn() as any;
const mockAddComment = jest.fn() as any;
const mockDeleteComment = jest.fn() as any;
const mockDeleteFile = jest.fn() as any;

jest.unstable_mockModule("@services/userReviewService", () => ({
  createReview: mockCreateReview,
  deleteReview: mockDeleteReview,
  getAllReviews: mockGetAllReviews,
  getEnrichedReviews: mockGetEnrichedReviews,
  getPopulatedReviewById: mockGetPopulatedReviewById,
  getReviewsByBookId: mockGetReviewsByBookId,
  getReviewsByUserId: mockGetReviewsByUserId,
  isReviewAuthor: mockIsReviewAuthor,
  updateReview: mockUpdateReview,
}));

jest.unstable_mockModule("@services/likeService", () => ({
  likeReview: mockLikeReview,
  unlikeReview: mockUnlikeReview,
}));

jest.unstable_mockModule("@services/commentService", () => ({
  addComment: mockAddComment,
  deleteComment: mockDeleteComment,
}));

jest.unstable_mockModule("@middlewares/authMiddleware", () => ({
  authenticate: (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    req.authenticatedUser = {
      id: "507f191e810c19729de860ea",
      username: "reader",
      email: "reader@example.com",
      avatar: "",
    };
    next();
  },
}));

jest.unstable_mockModule("@config/multerConfig", () => ({
  buildUploadUrl: (filename: string) => `/uploads/${filename}`,
  upload: {
    single: () => (req: Request, _res: Response, next: NextFunction) => {
      if (req.headers["x-test-file"] === "true") {
        req.file = {
          filename: "uploaded-cover.jpg",
          originalname: String(req.headers["x-test-filename"] ?? "cover.jpg"),
          path: "uploads/uploaded-cover.jpg",
        } as Express.Multer.File;
      }
      next();
    },
  },
}));

jest.unstable_mockModule("@utils/fileUtils", () => ({
  deleteFile: mockDeleteFile,
  isImageFile: (filename: string) => /\.(gif|jpe?g|png|webp)$/i.test(filename),
}));

jest.unstable_mockModule("@utils/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const userReviewRouter = (await import("@routes/userReview")).default;
const { errorHandler } = await import("@middlewares/errorHandler");

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/userReviews", userReviewRouter);
  app.use(errorHandler);
  return app;
};

describe("user review API routes", () => {
  const app = createApp();
  const authHeader = { Authorization: "Bearer test-token" };
  const reviewId = "507f191e810c19729de860eb";
  const bookId = "google-book-1";
  const review = {
    _id: reviewId,
    review: "Thoughtful review",
    rating: 4,
    likes: [],
    comments: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReviewAuthor.mockResolvedValue(true);
  });

  it("returns filtered and enriched reviews from query params", async () => {
    mockGetAllReviews.mockResolvedValue([review]);
    mockGetEnrichedReviews.mockResolvedValue([{ ...review, book: { title: "Dune" } }]);

    const response = await request(app)
      .get("/userReviews")
      .query({
        minLikes: "2",
        search: "space",
        username: "reader",
        rating: "4",
        genre: "Sci-Fi",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ ...review, book: { title: "Dune" } }]);
    expect(mockGetAllReviews).toHaveBeenCalledWith(
      2,
      "space",
      "reader",
      4,
      "Sci-Fi",
    );
    expect(mockGetEnrichedReviews).toHaveBeenCalledWith([review]);
  });

  it("gets a single populated review by ID", async () => {
    mockGetPopulatedReviewById.mockResolvedValue(review);

    const response = await request(app).get(`/userReviews/${reviewId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(review);
    expect(mockGetPopulatedReviewById).toHaveBeenCalledWith(reviewId);
  });

  it("rejects create requests without an image", async () => {
    const response = await request(app)
      .post("/userReviews")
      .set(authHeader)
      .send({ bookId, rating: 4, review: "A valid review body" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Post image is required");
    expect(mockCreateReview).not.toHaveBeenCalled();
  });

  it("creates a review with validated body and uploaded image path", async () => {
    mockCreateReview.mockResolvedValue(review);

    const response = await request(app)
      .post("/userReviews")
      .set(authHeader)
      .set("x-test-file", "true")
      .send({ bookId, rating: 4, review: "A valid review body" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(review);
    expect(mockCreateReview).toHaveBeenCalledWith(
      expect.any(Types.ObjectId),
      bookId,
      4,
      "A valid review body",
      "/uploads/uploaded-cover.jpg",
    );
  });

  it("updates an owned review", async () => {
    mockUpdateReview.mockResolvedValue({ ...review, rating: 5 });

    const response = await request(app)
      .patch(`/userReviews/${reviewId}`)
      .set(authHeader)
      .send({ rating: 5, review: "Updated review body" });

    expect(response.status).toBe(200);
    expect(response.body.rating).toBe(5);
    expect(mockIsReviewAuthor).toHaveBeenCalledWith(
      reviewId,
      "507f191e810c19729de860ea",
    );
    expect(mockUpdateReview).toHaveBeenCalledWith(reviewId, {
      rating: 5,
      review: "Updated review body",
    });
  });

  it("blocks updates for non-authors", async () => {
    mockIsReviewAuthor.mockResolvedValue(false);

    const response = await request(app)
      .patch(`/userReviews/${reviewId}`)
      .set(authHeader)
      .send({ rating: 5 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Not authorized to edit this review");
    expect(mockUpdateReview).not.toHaveBeenCalled();
  });

  it("deletes an owned review", async () => {
    mockDeleteReview.mockResolvedValue(undefined);

    const response = await request(app)
      .delete(`/userReviews/${reviewId}`)
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Review deleted successfully" });
    expect(mockDeleteReview).toHaveBeenCalledWith(reviewId);
  });

  it("likes and unlikes a review", async () => {
    mockLikeReview.mockResolvedValue(3);
    mockUnlikeReview.mockResolvedValue(2);

    const likeResponse = await request(app)
      .post(`/userReviews/${reviewId}/like`)
      .set(authHeader);
    const unlikeResponse = await request(app)
      .post(`/userReviews/${reviewId}/unlike`)
      .set(authHeader);

    expect(likeResponse.status).toBe(200);
    expect(likeResponse.body).toEqual({ likes: 3 });
    expect(unlikeResponse.status).toBe(200);
    expect(unlikeResponse.body).toEqual({ likes: 2 });
    expect(mockLikeReview).toHaveBeenCalledWith(
      reviewId,
      expect.any(Types.ObjectId),
    );
    expect(mockUnlikeReview).toHaveBeenCalledWith(
      reviewId,
      expect.any(Types.ObjectId),
    );
  });

  it("adds and deletes comments", async () => {
    const comments = [{ _id: "comment-1", comment: "Nice read" }];
    mockAddComment.mockResolvedValue(comments);
    mockDeleteComment.mockResolvedValue([]);

    const addResponse = await request(app)
      .post(`/userReviews/${reviewId}/comments`)
      .set(authHeader)
      .send({ comment: "  Nice read  " });
    const deleteResponse = await request(app)
      .delete(`/userReviews/${reviewId}/comments/comment-1`)
      .set(authHeader);

    expect(addResponse.status).toBe(200);
    expect(addResponse.body).toEqual(comments);
    expect(mockAddComment).toHaveBeenCalledWith(
      reviewId,
      expect.any(Types.ObjectId),
      "Nice read",
    );
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual([]);
    expect(mockDeleteComment).toHaveBeenCalledWith(
      reviewId,
      "comment-1",
      "507f191e810c19729de860ea",
    );
  });

  it("validates empty comments before calling the service", async () => {
    const response = await request(app)
      .post(`/userReviews/${reviewId}/comments`)
      .set(authHeader)
      .send({ comment: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Comment");
    expect(mockAddComment).not.toHaveBeenCalled();
  });
});
