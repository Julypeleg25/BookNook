import * as bookService from '../services/bookService';
import { bookRepository } from '@repositories/bookRepository';
import axios from 'axios';
import { jest } from '@jest/globals';

jest.mock("@xenova/transformers", () => ({
    pipeline: (jest.fn() as any).mockResolvedValue(() => Promise.resolve([[0.1, 0.2, 0.3]]))
}));

jest.mock('../services/ai/vectorSyncService', () => ({
    syncBookToVector: jest.fn(),
    syncReviewToVector: jest.fn(),
    syncUserProfileToVector: jest.fn(),
    deleteReviewFromVector: jest.fn(),
}));

jest.mock('axios');
jest.mock('@repositories/bookRepository');
jest.mock('@utils/logger');
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

describe('BookService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('normalizeBookSummary', () => {
        it('maps Google Books volume data into the BookNook summary shape', () => {
            const mockVolume = {
                id: 'vol123',
                volumeInfo: {
                    title: 'desdsdsds',
                    authors: ['Author One'],
                    imageLinks: { thumbnail: 'piccccc' },
                    publishedDate: '2023-01-01',
                    categories: ['Fiction'],
                },
            };

            const result = bookService.normalizeBookSummary(mockVolume as any);

            expect(result).toEqual({
                id: 'vol123',
                title: 'desdsdsds',
                authors: ['Author One'],
                thumbnail: 'piccccc',
                publishedDate: '2023-01-01',
                avgRating: undefined,
                ratingCount: undefined,
                genres: ['Fiction'],
            });
        });
    });

    describe('searchBooks', () => {
        it('queries Google Books and returns normalized summary results', async () => {
            const mockResponse = {
                data: {
                    items: [
                        { id: '1', volumeInfo: { title: 'Book 1', authors: ['A1'] } },
                    ],
                },
            };
            jest.spyOn(axios, 'get').mockResolvedValue(mockResponse);

            const result = await bookService.searchBooks({ title: 'test' });

            expect(result.items).toHaveLength(1);
            expect(result.items[0].title).toBe('Book 1');
            expect(axios.get).toHaveBeenCalled();
        });
    });

    describe('getBookDetails', () => {
        it('merges Google book data with local rating metadata', async () => {
            const mockGoogleBook = { id: 'ext123', volumeInfo: { title: 'Google Title', authors: [] } };
            const mockLocalBook = { externalId: 'ext123', avgRating: 4.5, ratingCount: 10 };

            jest.spyOn(axios, 'get').mockResolvedValue({ data: mockGoogleBook });
            jest.spyOn(bookRepository, 'findByExternalId').mockResolvedValue(mockLocalBook as any);

            const result = await bookService.getBookDetails('ext123');

            expect(result.title).toBe('Google Title');
            expect(result.avgRating).toBe(4.5);
        });
    });
});
