import { Types } from "mongoose";
import { jest } from '@jest/globals';

import { IBook } from '../models/Book';
import { IUserReview } from '../models/UserReview';
import User from "../models/User";

import * as userReviewService from "../services/userReviewService";
import { userReviewRepository } from "../repositories/userReviewRepository";
import * as bookService from "../services/bookService";
import * as ratingService from "../services/ratingService";
import * as vectorSyncService from "../services/ai/vectorSyncService";

jest.mock("@xenova/transformers", () => ({
    pipeline: (jest.fn() as any).mockResolvedValue(() => Promise.resolve([[0.1, 0.2, 0.3]]))
}));

jest.mock("../repositories/userReviewRepository");
jest.mock("../services/bookService");
jest.mock("../services/ratingService");
jest.mock("../services/ai/vectorSyncService");
jest.mock("../models/User");
jest.mock("../utils/logger");

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
            const mockBook = {
                _id: bookId,
                externalId: 'extId',
                categories: [],
                title: "Test Book",
                authors: [],
                thumbnail: "thumb",
                publishedDate: '',
                description: '',
                avgRating: 0,
                ratingCount: 0,
                ratingSum: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            } as unknown as IBook;

            const mockReview = {
                _id: reviewId,
                user: userId,
                book: bookId,
                review: "Great!",
                rating: 5,
                picturePath: '',
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                likes: [],
                imageUrl: '',
                description: '',
                createdDate: new Date()
            } as unknown as IUserReview;

            const mockUser = { _id: userId, username: "testuser" };

            jest.spyOn(bookService, 'getOrCreateLocalBook').mockResolvedValue(mockBook);
            jest.spyOn(userReviewRepository, 'create').mockResolvedValue(mockReview);
            jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

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
            const mockReview = {
                _id: reviewId,
                user: userId,
                book: bookId,
                review: "Updated",
                rating: 4,
                picturePath: '',
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                likes: [],
                imageUrl: '',
                description: '',
                createdDate: new Date()
            } as unknown as IUserReview;
            
            const mockUser = { _id: userId, username: "testuser" };

            jest.spyOn(userReviewRepository, 'update').mockResolvedValue(mockReview);
            jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

            const result = await userReviewService.updateReview(reviewId.toString(), { rating: 4 });

            expect(result).toEqual(mockReview);
            expect(userReviewRepository.update).toHaveBeenCalledWith(reviewId.toString(), { rating: 4 });
            expect(vectorSyncService.syncReviewToVector).toHaveBeenCalledWith(mockReview);
            expect(vectorSyncService.syncUserProfileToVector).toHaveBeenCalledWith(mockUser);
        });
    });

    describe("deleteReview", () => {
        it("should delete a review and trigger syncs", async () => {
            const mockReview = {
                _id: reviewId,
                user: userId,
                book: bookId,
                review: '',
                rating: 0,
                picturePath: '',
                comments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                likes: [],
                imageUrl: '',
                description: '',
                createdDate: new Date()
            } as unknown as IUserReview;
            
            const mockUser = { _id: userId, username: "testuser" };

            jest.spyOn(userReviewRepository, 'findById').mockResolvedValue(mockReview);
            jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

            await userReviewService.deleteReview(reviewId.toString());

            expect(userReviewRepository.delete).toHaveBeenCalledWith(reviewId.toString());
            expect(vectorSyncService.deleteReviewFromVector).toHaveBeenCalledWith(reviewId.toString());
            expect(vectorSyncService.syncUserProfileToVector).toHaveBeenCalledWith(mockUser);
        });
    });
});