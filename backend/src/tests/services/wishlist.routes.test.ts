import express, { type Request, type Response, type NextFunction } from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const mockAddBookToUserWishlist = jest.fn() as any;
const mockGetUserWishlist = jest.fn() as any;
const mockRemoveBookFromUserWishlist = jest.fn() as any;
const mockGetUserById = jest.fn() as any;

jest.unstable_mockModule("@services/wishlistService", () => ({
  addBookToUserWishlist: mockAddBookToUserWishlist,
  getUserWishlist: mockGetUserWishlist,
  removeBookFromUserWishlist: mockRemoveBookFromUserWishlist,
}));

jest.unstable_mockModule("@services/userService", () => ({
  getUserById: mockGetUserById,
}));

jest.unstable_mockModule("@middlewares/authMiddleware", () => ({
  authenticate: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    req.authenticatedUser = {
      id: "user-1",
      username: "reader",
      email: "reader@example.com",
      avatar: "",
    };
    next();
  },
}));

jest.unstable_mockModule("@utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

const wishlistRouter = (await import("@routes/wishlist")).default;
const { errorHandler } = await import("@middlewares/errorHandler");

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/wishlist", wishlistRouter);
  app.use(errorHandler);
  return app;
};

describe("wishlist API routes", () => {
  const app = createApp();
  const authHeader = { Authorization: "Bearer test-token" };
  const bookSummary = {
    id: "book-1",
    title: "Book One",
    authors: ["Author One"],
    thumbnail: "https://example.test/book.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects wishlist requests without a bearer token", async () => {
    const response = await request(app).get("/api/wishlist");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "No token provided" });
    expect(mockGetUserWishlist).not.toHaveBeenCalled();
  });

  it("returns the authenticated user's wishlist", async () => {
    mockGetUserById.mockResolvedValue({ id: "user-1" });
    mockGetUserWishlist.mockResolvedValue([bookSummary]);

    const response = await request(app)
      .get("/api/wishlist")
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([bookSummary]);
    expect(mockGetUserById).toHaveBeenCalledWith("user-1");
    expect(mockGetUserWishlist).toHaveBeenCalledWith("user-1");
  });

  it("filters nullish wishlist items from API responses", async () => {
    mockGetUserById.mockResolvedValue({ id: "user-1" });
    mockGetUserWishlist.mockResolvedValue([bookSummary, null, undefined]);

    const response = await request(app)
      .get("/api/wishlist")
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([bookSummary]);
  });

  it("adds a book to the authenticated user's wishlist", async () => {
    mockAddBookToUserWishlist.mockResolvedValue([bookSummary]);

    const response = await request(app)
      .post("/api/wishlist/book-1")
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([bookSummary]);
    expect(mockAddBookToUserWishlist).toHaveBeenCalledWith("user-1", "book-1");
  });

  it("supports encoded book IDs in add requests", async () => {
    mockAddBookToUserWishlist.mockResolvedValue([bookSummary]);

    const response = await request(app)
      .post("/api/wishlist/google%3Abook%2F1")
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(mockAddBookToUserWishlist).toHaveBeenCalledWith(
      "user-1",
      "google:book/1",
    );
  });

  it("removes a book from the authenticated user's wishlist", async () => {
    mockRemoveBookFromUserWishlist.mockResolvedValue([]);

    const response = await request(app)
      .delete("/api/wishlist/book-1")
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(mockRemoveBookFromUserWishlist).toHaveBeenCalledWith(
      "user-1",
      "book-1",
    );
  });

  it("returns a handled error response when the wishlist service fails", async () => {
    mockAddBookToUserWishlist.mockRejectedValue(new Error("wishlist failed"));

    const response = await request(app)
      .post("/api/wishlist/book-1")
      .set(authHeader);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "wishlist failed",
      code: "INTERNAL_ERROR",
    });
  });
});
