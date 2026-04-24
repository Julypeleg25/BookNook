import { jest } from '@jest/globals';

const mockAddBookToList = jest.fn() as any;
const mockGetList = jest.fn() as any;
const mockGetBook = jest.fn() as any;
const mockNormalize = jest.fn() as any;


jest.unstable_mockModule('@repositories/userRepository', () => ({
    userRepository: {
        addBookToList: mockAddBookToList,
        getList: mockGetList,
    }
}));

jest.unstable_mockModule('../services/bookService', () => ({
    getBookByGoogleIdFromGoogle: mockGetBook,
    normalizeBookSummary: mockNormalize,
}));

jest.unstable_mockModule("@xenova/transformers", () => ({
    pipeline: (jest.fn() as any).mockResolvedValue(() => Promise.resolve([[0.1, 0.2, 0.3]]))
}));


const listService = await import('../services/listService');

describe('ListService', () => {
    const userId = '507f191e810c19729de860ea'; 
    const bookId = 'bookkk';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addBookToUserList', () => {
        it('adds the requested book to the selected user list', async () => {
            mockAddBookToList.mockResolvedValue(['book1', 'book2']);

            const result = await listService.addBookToUserList(userId, bookId, 'wish');

            expect(result).toEqual(['book1', 'book2']);
            expect(mockAddBookToList).toHaveBeenCalledWith(userId, bookId, 'wish');
        });
    });

    describe('getUserWishOrReadlist', () => {
        it('returns the saved list enriched with Google Books details', async () => {
            mockGetList.mockResolvedValue(['id1']);
            mockGetBook.mockResolvedValue({ id: 'id1', volumeInfo: { title: 'Book 1' } });
            mockNormalize.mockReturnValue({ id: 'id1', title: 'Book 1' });

            const result = await listService.getUserWishOrReadlist(userId, 'read');

            expect(result).toHaveLength(1);
            expect(mockGetList).toHaveBeenCalledWith(userId, 'read');
            expect(mockGetBook).toHaveBeenCalledWith('id1');
        });
    });
});
