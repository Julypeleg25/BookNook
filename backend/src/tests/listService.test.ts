import { jest } from "@jest/globals";

const mockAddBookToWishlist = jest.fn() as any;
const mockGetWishlist = jest.fn() as any;
const mockRemoveBookFromWishlist = jest.fn() as any;
const mockGetBook = jest.fn() as any;
const mockGetLocalBook = jest.fn() as any;
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

let listService: typeof import("../services/listService");

describe("ListService", () => {
  const userId = "507f191e810c19729de860ea";
  const bookId = "bookkk";

  beforeAll(async () => {
    listService = await import("../services/listService");
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addBookToUserWishlist", () => {
    it("adds the requested book and returns the enriched source-of-truth list", async () => {
      mockAddBookToWishlist.mockResolvedValue(["id1"]);
      mockGetWishlist.mockResolvedValue(["id1"]);
      mockGetBook.mockResolvedValue({ id: "id1", volumeInfo: { title: "Book 1" } });
      mockNormalize.mockReturnValue({ id: "id1", title: "Book 1" });

      const result = await listService.addBookToUserWishlist(userId, bookId);

      expect(result).toEqual([{ id: "id1", title: "Book 1" }]);
      expect(mockAddBookToWishlist).toHaveBeenCalledWith(userId, bookId);
      expect(mockGetWishlist).toHaveBeenCalledWith(userId);
    });
  });

  describe("getUserWishlist", () => {
    it("returns the saved list enriched with Google Books details", async () => {
      mockGetWishlist.mockResolvedValue(["id1"]);
      mockGetBook.mockResolvedValue({ id: "id1", volumeInfo: { title: "Book 1" } });
      mockNormalize.mockReturnValue({ id: "id1", title: "Book 1" });

      const result = await listService.getUserWishlist(userId);

      expect(result).toHaveLength(1);
      expect(mockGetWishlist).toHaveBeenCalledWith(userId);
      expect(mockGetBook).toHaveBeenCalledWith("id1");
      expect(mockNormalize).toHaveBeenCalledWith(
        expect.objectContaining({ id: "id1" }),
      );
    });

    it("falls back to local book data when Google Books lookup fails", async () => {
      mockGetWishlist.mockResolvedValue(["id1"]);
      mockGetBook.mockRejectedValue(new Error("google failed"));
      mockGetLocalBook.mockResolvedValue({
        externalId: "id1",
        title: "Local Book",
      });
      mockNormalizeLocal.mockReturnValue({ id: "id1", title: "Local Book" });

      const result = await listService.getUserWishlist(userId);

      expect(result).toEqual([{ id: "id1", title: "Local Book" }]);
      expect(mockGetLocalBook).toHaveBeenCalledWith("id1");
      expect(mockNormalizeLocal).toHaveBeenCalledWith(
        expect.objectContaining({ externalId: "id1" }),
      );
    });
  });

  describe("removeBookFromUserWishlist", () => {
    it("removes the requested book and returns the enriched source-of-truth list", async () => {
      mockRemoveBookFromWishlist.mockResolvedValue(["book2"]);
      mockGetWishlist.mockResolvedValue(["book2"]);
      mockGetBook.mockResolvedValue({ id: "book2", volumeInfo: { title: "Book 2" } });
      mockNormalize.mockReturnValue({ id: "book2", title: "Book 2" });

      const result = await listService.removeBookFromUserWishlist(
        userId,
        bookId,
      );

      expect(result).toEqual([{ id: "book2", title: "Book 2" }]);
      expect(mockRemoveBookFromWishlist).toHaveBeenCalledWith(
        userId,
        bookId,
      );
      expect(mockGetWishlist).toHaveBeenCalledWith(userId);
    });
  });
});
