import * as listService from '../services/listService';
import { userRepository } from '@repositories/userRepository';
import * as bookService from '../services/bookService';

jest.mock('@repositories/userRepository');
jest.mock('../services/bookService');
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

describe('ListService', () => {
    const userId = 'user123';
    const bookId = 'book456';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addBookToUserList', () => {
        it('should call userRepository.addBookToList', async () => {
            (userRepository.addBookToList as jest.Mock).mockResolvedValue(['book1', 'book2']);

            const result = await listService.addBookToUserList(userId, bookId, 'wish');

            expect(result).toEqual(['book1', 'book2']);
            expect(userRepository.addBookToList).toHaveBeenCalledWith(userId, bookId, 'wish');
        });

        it('should throw ValidationError for invalid list type', async () => {
            await expect(listService.addBookToUserList(userId, bookId, 'invalid' as any))
                .rejects.toThrow('Invalid list type');
        });
    });

    describe('getUserWishOrReadlist', () => {
        it('should fetch list and enrich with Google Books data', async () => {
            const mockGoogleIds = ['id1'];
            const mockGoogleVolume = { id: 'id1', volumeInfo: { title: 'Book 1' } };
            const mockSummary = { id: 'id1', title: 'Book 1' };

            (userRepository.getList as jest.Mock).mockResolvedValue(mockGoogleIds);
            (bookService.getBookByGoogleIdFromGoogle as jest.Mock).mockResolvedValue(mockGoogleVolume as any);
            (bookService.normalizeBookSummary as jest.Mock).mockReturnValue(mockSummary as any);

            const result = await listService.getUserWishOrReadlist(userId, 'read');

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockSummary);
            expect(userRepository.getList).toHaveBeenCalledWith(userId, 'read');
        });
    });
});
