import * as bookService from '../services/bookService';
import { bookRepository } from '@repositories/bookRepository';
import axios from 'axios';

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
        it('should correctly normalize Google Books volume data', () => {
            const mockVolume = {
                id: 'vol123',
                volumeInfo: {
                    title: 'Test Title',
                    authors: ['Author One'],
                    imageLinks: { thumbnail: 'thumb-url' },
                    publishedDate: '2023-01-01',
                    categories: ['Fiction'],
                },
            };

            const result = bookService.normalizeBookSummary(mockVolume as any);

            expect(result).toEqual({
                id: 'vol123',
                title: 'Test Title',
                authors: ['Author One'],
                thumbnail: 'thumb-url',
                publishedDate: '2023-01-01',
                avgRating: undefined,
                ratingCount: undefined,
                genres: ['Fiction'],
            });
        });
    });

    describe('searchBooks', () => {
        it('should call Google Books API and return normalized results', async () => {
            const mockResponse = {
                data: {
                    items: [
                        { id: '1', volumeInfo: { title: 'Book 1', authors: ['A1'] } },
                    ],
                },
            };
            (axios.get as jest.Mock).mockResolvedValue(mockResponse);

            const result = await bookService.searchBooks({ title: 'test' });

            expect(result.items).toHaveLength(1);
            expect(result.items[0].title).toBe('Book 1');
            expect(axios.get).toHaveBeenCalled();
        });
    });

    describe('getBookDetails', () => {
        it('should combine Google data with local repository data', async () => {
            const mockGoogleBook = { id: 'ext123', volumeInfo: { title: 'Google Title', authors: [] } };
            const mockLocalBook = { externalId: 'ext123', avgRating: 4.5, ratingCount: 10 };

            (axios.get as jest.Mock).mockResolvedValue({ data: mockGoogleBook });
            (bookRepository.findByExternalId as jest.Mock).mockResolvedValue(mockLocalBook as any);

            const result = await bookService.getBookDetails('ext123');

            expect(result.title).toBe('Google Title');
            expect(result.avgRating).toBe(4.5);
        });
    });
});
