import { Types } from "mongoose";
import { jest } from '@jest/globals';

// 1. STANDALONE MOCKS (The Bridge)
// We define these as 'any' to stop the ts(2345) 'never' errors immediately.
const mockCreate: any = jest.fn();
const mockFindById: any = jest.fn();
const mockGetOrCreate: any = jest.fn();
const mockUserFind: any = jest.fn();

// 2. THE IRON WALL (Mocking every possible way the repo/service is called)
// This kills the "Buffering Timeout" for good.
const bookRepoMock = { bookRepository: { getOrCreate: mockGetOrCreate, findByExternalId: jest.fn() } };

jest.mock("../repositories/userReviewRepository", () => ({
    userReviewRepository: { create: mockCreate, findById: mockFindById, update: jest.fn(), delete: jest.fn() }
}));

jest.mock("../services/bookService", () => ({ getOrCreateLocalBook: mockGetOrCreate }));

// Catch both relative and alias paths
jest.mock("../repositories/bookRepository", () => bookRepoMock);
jest.mock("@repositories/bookRepository", () => bookRepoMock); 

jest.mock("../models/User", () => ({ __esModule: true, default: { findById: mockUserFind } }));
jest.mock("../services/ratingService", () => ({ recomputeBookRating: jest.fn() }));
jest.mock("../services/ai/vectorSyncService", () => ({ syncReviewToVector: jest.fn(), deleteReviewFromVector: jest.fn() }));
jest.mock("../utils/logger", () => ({ logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() } }));

// 3. IMPORT THE SERVICE LAST
import * as userReviewService from "../services/userReviewService";

describe("UserReviewService", () => {
    beforeEach(() => jest.clearAllMocks());

    it("should finally work without timeouts or type errors", async () => {
        const userId = new Types.ObjectId();
        const review = { _id: new Types.ObjectId(), user: userId };

        // No more 'as never' needed here because the mock constants were typed 'any'
        mockGetOrCreate.mockResolvedValue({ _id: new Types.ObjectId() });
        mockCreate.mockResolvedValue(review);
        mockUserFind.mockResolvedValue({ _id: userId });

        const result = await userReviewService.createReview(userId, "id", 5, "text");

        expect(result).toEqual(review);
        expect(mockCreate).toHaveBeenCalled();
    });
});