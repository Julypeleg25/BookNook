import { jest } from "@jest/globals";

const mockAddBookToWishlist = jest.fn() as any;
const mockGetWishlist = jest.fn() as any;
const mockRemoveBookFromWishlist = jest.fn() as any;
const mockGetBook = jest.fn() as any;
const mockGetLocalBook = jest.fn() as any;
const mockGetLocalBookByLocalId = jest.fn() as any;
const mockNormalize = jest.fn() as any;
const mockNormalizeLocal = jest.fn() as any;

jest.unstable_mockModule("@repositories/userRepository", () => ({
  userRepository: {
    addBookToWishlist: mockAddBookToWishlist,
    getWishlist: mockGetWishlist,
    removeBookFromWishlist: mockRemoveBookFromWishlist,
  },
}));

jest.unstable_mockModule("../services/bookService", () => ({
  getBookByGoogleIdFromGoogle: mockGetBook,
  getLocalBookByGoogleId: mockGetLocalBook,
  getLocalBookByLocalId: mockGetLocalBookByLocalId,
  normalizeBookSummary: mockNormalize,
  normalizeLocalBookSummary: mockNormalizeLocal,
}));

jest.unstable_mockModule("@utils/logger", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

jest.unstable_mockModule("@xenova/transformers", () => ({
  pipeline: (jest.fn() as any).mockResolvedValue(() =>
    Promise.resolve([[0.1, 0.2, 0.3]])
  ),
}));

let wishlistService: typeof import("../services/wishlistService");

describe("WishlistService", () => {
  const userId = "507f191e810c19729de860ea";
  const bookId = "bookkk";

  beforeAll(async () => {
    wishlistService = await import("../services/wishlistService");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLocalBook.mockResolvedValue(null);
    mockGetLocalBookByLocalId.mockResolvedValue(null);
  });

  describe("addBookToUserWishlist", () => {
    it("adds the requested book and returns the enriched source-of-truth wishlist", async () => {
      mockAddBookToWishlist.mockResolvedValue(["id1"]);
      mockGetWishlist.mockResolvedValue(["id1"]);
      mockGetBook.mockResolvedValue({ id: "id1", volumeInfo: { title: "Book 1" } });
      mockNormalize.mockReturnValue({ id: "id1", title: "Book 1" });

      const result = await wishlistService.addBookToUserWishlist(userId, bookId);

      expect(result).toEqual([{ id: "id1", title: "Book 1" }]);
      expect(mockAddBookToWishlist).toHaveBeenCalledWith(userId, bookId);
      expect(mockGetWishlist).toHaveBeenCalledWith(userId);
    });
  });

  describe("getUserWishlist", () => {
    it("returns the saved wishlist enriched with Google Books details", async () => {
      mockGetWishlist.mockResolvedValue(["id1"]);
      mockGetBook.mockResolvedValue({ id: "id1", volumeInfo: { title: "Book 1" } });
      mockNormalize.mockReturnValue({ id: "id1", title: "Book 1" });

      const result = await wishlistService.getUserWishlist(userId);

      expect(result).toHaveLength(1);
      expect(mockGetWishlist).toHaveBeenCalledWith(userId);
      expect(mockGetBook).toHaveBeenCalledWith("id1");
      expect(mockNormalize).toHaveBeenCalledWith(
        expect.objectContaining({ id: "id1" }),
      );
    });

    it("uses local book data by Google ID before calling Google Books", async () => {
      mockGetWishlist.mockResolvedValue(["id1"]);
      mockGetLocalBook.mockResolvedValue({
        externalId: "id1",
        title: "Local Book",
      });
      mockNormalizeLocal.mockReturnValue({ id: "id1", title: "Local Book" });

      const result = await wishlistService.getUserWishlist(userId);

      expect(result).toEqual([{ id: "id1", title: "Local Book" }]);
      expect(mockGetLocalBook).toHaveBeenCalledWith("id1");
      expect(mockGetBook).not.toHaveBeenCalled();
      expect(mockNormalizeLocal).toHaveBeenCalledWith(
        expect.objectContaining({ externalId: "id1" }),
      );
    });

    it("resolves old wishlist entries saved as local Mongo book IDs", async () => {
      const localBookId = "507f191e810c19729de860ea";
      mockGetWishlist.mockResolvedValue([localBookId]);
      mockGetLocalBookByLocalId.mockResolvedValue({
        _id: localBookId,
        externalId: "google-book-id",
        title: "Local Book",
      });
      mockNormalizeLocal.mockReturnValue({
        id: "google-book-id",
        title: "Local Book",
      });

      const result = await wishlistService.getUserWishlist(userId);

      expect(result).toEqual([{ id: "google-book-id", title: "Local Book" }]);
      expect(mockGetLocalBook).toHaveBeenCalledWith(localBookId);
      expect(mockGetLocalBookByLocalId).toHaveBeenCalledWith(localBookId);
      expect(mockGetBook).not.toHaveBeenCalled();
    });
  });

  describe("removeBookFromUserWishlist", () => {
    it("removes the requested book and returns the enriched source-of-truth wishlist", async () => {
      mockRemoveBookFromWishlist.mockResolvedValue(["book2"]);
      mockGetWishlist.mockResolvedValue(["book2"]);
      mockGetBook.mockResolvedValue({ id: "book2", volumeInfo: { title: "Book 2" } });
      mockNormalize.mockReturnValue({ id: "book2", title: "Book 2" });

      const result = await wishlistService.removeBookFromUserWishlist(
        userId,
        bookId,
      );

      expect(result).toEqual([{ id: "book2", title: "Book 2" }]);
      expect(mockRemoveBookFromWishlist).toHaveBeenCalledWith(userId, [bookId]);
      expect(mockGetWishlist).toHaveBeenCalledWith(userId);
    });

    it("removes both Google and local IDs so legacy wishlist entries do not come back", async () => {
      const localBookId = "507f191e810c19729de860ea";
      mockGetLocalBook.mockResolvedValue({
        _id: localBookId,
        externalId: bookId,
        title: "Local Book",
      });
      mockRemoveBookFromWishlist.mockResolvedValue([]);
      mockGetWishlist.mockResolvedValue([]);

      const result = await wishlistService.removeBookFromUserWishlist(
        userId,
        bookId,
      );

      expect(result).toEqual([]);
      expect(mockRemoveBookFromWishlist).toHaveBeenCalledWith(
        userId,
        [bookId, localBookId],
      );
    });
  });
});


