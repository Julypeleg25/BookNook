import { jest } from "@jest/globals";

const mockAddBookToList = jest.fn() as any;
const mockGetList = jest.fn() as any;
const mockRemoveBookFromList = jest.fn() as any;
const mockGetBook = jest.fn() as any;
const mockGetLocalBook = jest.fn() as any;
const mockNormalize = jest.fn() as any;
const mockNormalizeLocal = jest.fn() as any;

jest.unstable_mockModule("@repositories/userRepository", () => ({
  userRepository: {
    addBookToList: mockAddBookToList,
    getList: mockGetList,
    removeBookFromList: mockRemoveBookFromList,
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

const listService = await import("../services/listService");

describe("ListService", () => {
  const userId = "507f191e810c19729de860ea";
  const bookId = "bookkk";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addBookToUserList", () => {
    it("adds the requested book to the selected user list", async () => {
      mockAddBookToList.mockResolvedValue(["book1", "book2"]);

      const result = await listService.addBookToUserList(userId, bookId, "wish");

      expect(result).toEqual(["book1", "book2"]);
      expect(mockAddBookToList).toHaveBeenCalledWith(userId, bookId, "wish");
    });
  });

  describe("getUserWishOrReadlist", () => {
    it("returns the saved list enriched with Google Books details", async () => {
      mockGetList.mockResolvedValue(["id1"]);
      mockGetBook.mockResolvedValue({ id: "id1", volumeInfo: { title: "Book 1" } });
      mockNormalize.mockReturnValue({ id: "id1", title: "Book 1" });

      const result = await listService.getUserWishOrReadlist(userId, "read");

      expect(result).toHaveLength(1);
      expect(mockGetList).toHaveBeenCalledWith(userId, "read");
      expect(mockGetBook).toHaveBeenCalledWith("id1");
      expect(mockNormalize).toHaveBeenCalledWith(
        expect.objectContaining({ id: "id1" }),
      );
    });

    it("falls back to local book data when Google Books lookup fails", async () => {
      mockGetList.mockResolvedValue(["id1"]);
      mockGetBook.mockRejectedValue(new Error("google failed"));
      mockGetLocalBook.mockResolvedValue({
        externalId: "id1",
        title: "Local Book",
      });
      mockNormalizeLocal.mockReturnValue({ id: "id1", title: "Local Book" });

      const result = await listService.getUserWishOrReadlist(userId, "wish");

      expect(result).toEqual([{ id: "id1", title: "Local Book" }]);
      expect(mockGetLocalBook).toHaveBeenCalledWith("id1");
      expect(mockNormalizeLocal).toHaveBeenCalledWith(
        expect.objectContaining({ externalId: "id1" }),
      );
    });
  });

  describe("removeBookFromUserList", () => {
    it("removes the requested book from the selected user list", async () => {
      mockRemoveBookFromList.mockResolvedValue(["book2"]);

      const result = await listService.removeBookFromUserList(
        userId,
        bookId,
        "read",
      );

      expect(result).toEqual(["book2"]);
      expect(mockRemoveBookFromList).toHaveBeenCalledWith(
        userId,
        bookId,
        "read",
      );
    });
  });
});
