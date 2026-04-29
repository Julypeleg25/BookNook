import * as bookService from '../../services/bookService';
import { bookRepository } from '@repositories/bookRepository';
import axios from 'axios';
import { jest } from '@jest/globals';

jest.mock("@xenova/transformers", () => ({
    pipeline: (jest.fn() as any).mockResolvedValue(() => Promise.resolve([[0.1, 0.2, 0.3]]))
}));

jest.mock('../../services/ai/vectorSyncService', () => ({
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
        jest.restoreAllMocks();
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

        it('builds combined Google queries and clamps invalid pagination input', async () => {
            const items = Array.from({ length: 40 }, (_, index) => ({
                id: `book-${index}`,
                volumeInfo: { title: `Book ${index}` },
            }));
            jest.spyOn(axios, 'get').mockResolvedValue({ data: { items } });

            const result = await bookService.searchBooks({
                title: 'Dune',
                author: 'Herbert',
                subject: 'Science Fiction',
                page: '-3',
                limit: '999',
            });

            expect(result).toEqual(
                expect.objectContaining({
                    page: 1,
                    limit: 40,
                    hasNextPage: true,
                }),
            );
            expect(axios.get).toHaveBeenCalledWith(
                'https://www.googleapis.com/books/v1/volumes',
                expect.objectContaining({
                    params: expect.objectContaining({
                        q: 'intitle:"Dune" inauthor:"Herbert" subject:"Science Fiction"',
                        startIndex: 0,
                        maxResults: 40,
                    }),
                }),
            );
        });

        it('uses an empty Google query and empty result set when no search terms match', async () => {
            jest.spyOn(axios, 'get').mockResolvedValue({ data: {} });

            const result = await bookService.searchBooks({});

            expect(result.items).toEqual([]);
            expect(result.hasNextPage).toBe(false);
            expect(axios.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    params: expect.objectContaining({ q: '""' }),
                }),
            );
        });
    });

    describe('localSearchBooks', () => {
        it('delegates local search filters and maps local books to summaries', async () => {
            jest.spyOn(bookRepository, 'localSearchBooks').mockResolvedValue({
                items: [
                    {
                        externalId: 'google-1',
                        title: 'Local Book',
                        authors: ['Author'],
                        thumbnail: 'cover',
                        publishedDate: '2024',
                        avgRating: 4,
                        ratingCount: 12,
                        categories: ['Fantasy'],
                    },
                ],
                total: 1,
            } as any);

            const result = await bookService.localSearchBooks({
                title: 'Local',
                author: 'Author',
                rating: 3,
                reviewCount: 5,
                subject: 'Fantasy',
                page: '2',
                limit: '1',
            });

            expect(bookRepository.localSearchBooks).toHaveBeenCalledWith({
                page: 2,
                limit: 1,
                title: 'Local',
                author: 'Author',
                minRating: 3,
                minReviews: 5,
                subject: 'Fantasy',
            });
            expect(result).toEqual({
                page: 2,
                limit: 1,
                items: [
                    expect.objectContaining({
                        id: 'google-1',
                        title: 'Local Book',
                        genres: ['Fantasy'],
                    }),
                ],
                hasNextPage: true,
            });
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

        it('keeps Google rating metadata when no local book exists', async () => {
            jest.spyOn(axios, 'get').mockResolvedValue({
                data: {
                    id: 'ext123',
                    volumeInfo: {
                        title: 'Google Title',
                        authors: [],
                        averageRating: 3.5,
                        ratingsCount: 8,
                    },
                },
            });
            jest.spyOn(bookRepository, 'findByExternalId').mockResolvedValue(null);

            const result = await bookService.getBookDetails('ext123');

            expect(result.avgRating).toBe(3.5);
            expect(result.ratingCount).toBe(8);
        });
    });

    describe('getGoogleBookByLocalId', () => {
        it('rejects invalid local ids before querying the repository', async () => {
            const findByIdSpy = jest.spyOn(bookRepository, 'findById');

            await expect(bookService.getGoogleBookByLocalId('[object Object]')).rejects.toThrow(
                'Invalid localId provided',
            );
            expect(findByIdSpy).not.toHaveBeenCalled();
        });

        it('throws when the local book is missing', async () => {
            jest.spyOn(bookRepository, 'findById').mockResolvedValue(null);

            await expect(bookService.getGoogleBookByLocalId('local-id')).rejects.toThrow(
                'Book not found',
            );
        });

        it('loads the Google volume for the local book external id', async () => {
            jest.spyOn(bookRepository, 'findById').mockResolvedValue({
                externalId: 'google-id',
            } as any);
            jest.spyOn(axios, 'get').mockResolvedValue({
                data: { id: 'google-id', volumeInfo: { title: 'Google Book' } },
            });

            const result = await bookService.getGoogleBookByLocalId('local-id');

            expect(result.id).toBe('google-id');
            expect(axios.get).toHaveBeenCalledWith(
                'https://www.googleapis.com/books/v1/volumes/google-id',
                expect.any(Object),
            );
        });
    });

    it('delegates local book lookups and creation to the repository', async () => {
        jest.spyOn(bookRepository, 'findByExternalId').mockResolvedValue({ externalId: 'g1' } as any);
        jest.spyOn(bookRepository, 'findById').mockResolvedValue({ _id: 'local' } as any);
        jest.spyOn(bookRepository, 'getOrCreate').mockResolvedValue({ externalId: 'g2' } as any);

        await expect(bookService.getLocalBookByGoogleId('g1')).resolves.toEqual({ externalId: 'g1' });
        await expect(bookService.getLocalBookByLocalId('local')).resolves.toEqual({ _id: 'local' });
        await expect(bookService.getOrCreateLocalBook('g2')).resolves.toEqual({ externalId: 'g2' });
    });
});
