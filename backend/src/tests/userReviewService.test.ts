import { Types } from "mongoose";
import * as userReviewService from "../services/userReviewService";
import { userReviewRepository } from "../repositories/userReviewRepository";
import * as bookService from "../services/bookService";
import * as ratingService from "../services/ratingService";
import * as vectorSyncService from "../services/ai/vectorSyncService";
import User from "../models/User";

jest.mock("../repositories/userReviewRepository");
jest.mock("../services/bookService");
jest.mock("../services/ratingService");
jest.mock("../services/ai/vectorSyncService");
jest.mock("../models/User");
jest.mock('@config/config', () => ({
    ENV: {
        NODE_ENV: 'test',
        PORT: 3000,
        MONGODB_URL: 'mongodb://localhost:27017/test',
        FRONTEND_URL: 'http://localhost:5173',
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        ACCESS_TOKEN_EXPIRES_IN: '15m',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        COOKIE_SECURE: false,
        GOOGLE_CLIENT_SECRET: 'test-secret',
        GOOGLE_CLIENT_ID: 'test-id',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/callback',
        SESSION_SECRET: 'test-session-secret',
        GOOGLE_BOOKS_API_KEY: 'test-key',
        GOOGLE_BOOKS_API: 'https://www.googleapis.com/books/v1/volumes',
        PGVECTOR_URL: 'postgresql://localhost:5432/test',
        GEMINI_API_KEY: 'test-gemini-key',
    },
}));

describe("UserReviewService", () => {
    const userId = new Types.ObjectId();
    const bookId = new Types.ObjectId();
    const reviewId = new Types.ObjectId();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createReview", () => {
        it("should create a review and trigger syncs", async () => {
            const mockBook = { _id: bookId, title: "Test Book", thumbnail: "thumb" };
            const mockReview = { _id: reviewId, user: userId, book: bookId, rating: 5, review: "Great!" };
            const mockUser = { _id: userId, username: "testuser" };

            (bookService.getOrCreateLocalBook as jest.Mock).mockResolvedValue(mockBook);
            (userReviewRepository.create as jest.Mock).mockResolvedValue(mockReview);
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await userReviewService.createReview(userId, "extId", 5, "Great!");

            expect(result).toEqual(mockReview);
            expect(bookService.getOrCreateLocalBook).toHaveBeenCalledWith("extId");
            expect(userReviewRepository.create).toHaveBeenCalled();
            expect(ratingService.recomputeBookRating).toHaveBeenCalledWith(bookId.toString());
            expect(vectorSyncService.syncReviewToVector).toHaveBeenCalledWith(mockReview);
            expect(vectorSyncService.syncUserProfileToVector).toHaveBeenCalledWith(mockUser);
        });
    });

    describe("updateReview", () => {
        it("should update a review and trigger syncs", async () => {
            const mockReview = { _id: reviewId, user: userId, book: bookId, rating: 4, review: "Updated" };
            const mockUser = { _id: userId, username: "testuser" };

            (userReviewRepository.update as jest.Mock).mockResolvedValue(mockReview);
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await userReviewService.updateReview(reviewId.toString(), { rating: 4 });

            expect(result).toEqual(mockReview);
            expect(userReviewRepository.update).toHaveBeenCalledWith(reviewId.toString(), { rating: 4 });
            expect(vectorSyncService.syncReviewToVector).toHaveBeenCalledWith(mockReview);
            expect(vectorSyncService.syncUserProfileToVector).toHaveBeenCalledWith(mockUser);
        });
    });

    describe("deleteReview", () => {
        it("should delete a review and trigger syncs", async () => {
            const mockReview = { _id: reviewId, user: userId, book: bookId };
            const mockUser = { _id: userId, username: "testuser" };

            (userReviewRepository.findById as jest.Mock).mockResolvedValue(mockReview);
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            await userReviewService.deleteReview(reviewId.toString());

            expect(userReviewRepository.delete).toHaveBeenCalledWith(reviewId.toString());
            expect(vectorSyncService.deleteReviewFromVector).toHaveBeenCalledWith(reviewId.toString());
            expect(vectorSyncService.syncUserProfileToVector).toHaveBeenCalledWith(mockUser);
        });
    });
});
