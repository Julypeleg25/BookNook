import { jest } from "@jest/globals";
import { SearchResult } from "@services/ai/vectorRepository";

const mockFetchChunksByMetadata = jest.fn<(filters: Record<string, string>) => Promise<SearchResult[]>>();
const mockSimilaritySearch = jest.fn<() => Promise<SearchResult[]>>();
const mockGenerateEmbedding = jest.fn<() => Promise<number[]>>();
const mockLean = jest.fn<() => Promise<{ readlist: string[]; wishlist: string[] }>>();
const mockSelect = jest.fn(() => ({ lean: mockLean }));
const mockFindById = jest.fn(() => ({ select: mockSelect }));

jest.unstable_mockModule("@services/ai/vectorRepository", () => ({
    fetchChunksByMetadata: mockFetchChunksByMetadata,
    similaritySearch: mockSimilaritySearch,
}));

jest.unstable_mockModule("@services/ai/embeddingService", () => ({
    generateEmbedding: mockGenerateEmbedding,
}));

jest.unstable_mockModule("@models/User", () => ({
    default: {
        findById: mockFindById,
    },
}));

const { performSearch } = await import("@services/ai/searchService");

describe("AI search service personalization", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFindById.mockReturnValue({ select: mockSelect });
        mockSelect.mockReturnValue({ lean: mockLean });
        mockGenerateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
        mockFetchChunksByMetadata.mockImplementation((filters: Record<string, string>) => {
            if (filters.type === "profile") {
                return Promise.resolve([
                    {
                        id: "profile-1",
                        bookId: "N/A",
                        type: "profile",
                        text: "User likes atmospheric mysteries.",
                        rating: null,
                        metadata: { userId: "user-123", type: "profile" },
                        score: 1,
                    },
                ]);
            }

            return Promise.resolve([
                {
                    id: "own-review-1",
                    bookId: "book-read",
                    type: "review",
                    text: "User reviewed Read Book. Rating: 5/5.",
                    rating: 5,
                    metadata: { userId: "user-123", externalId: "reviewed-ext" },
                    score: 1,
                },
                {
                    id: "other-review",
                    bookId: "book-other",
                    type: "review",
                    text: "Another user review should not be fetched by user metadata.",
                    rating: 5,
                    metadata: { userId: "other-user", externalId: "other-ext" },
                    score: 1,
                },
            ]);
        });
        mockLean.mockResolvedValue({ readlist: ["read-ext"], wishlist: ["wish-ext"] });
        mockSimilaritySearch.mockResolvedValue([
            {
                id: "candidate-1",
                bookId: "book-candidate",
                type: "book",
                text: "Book: New Mystery.",
                rating: null,
                metadata: { externalId: "candidate-ext" },
                score: 0.9,
            },
        ]);
    });

    it("uses only current user data for taste and excludes known read books from candidates", async () => {
        const result = await performSearch("What should I read?", {
            userId: "user-123",
            personalized: true,
            topK: 6,
        });

        expect(mockFetchChunksByMetadata).toHaveBeenCalledWith({ userId: "user-123", type: "profile" });
        expect(mockFetchChunksByMetadata).toHaveBeenCalledWith({ userId: "user-123" });
        expect(mockSimilaritySearch).toHaveBeenCalledWith([0.1, 0.2, 0.3], {
            topK: 6,
            typeFilter: null,
            excludeExternalIds: ["reviewed-ext", "read-ext"],
        });
        expect(result.userTasteChunks.map((chunk) => chunk.id)).toEqual(["profile-1", "own-review-1"]);
        expect(result.candidateChunks.map((chunk) => chunk.id)).toEqual(["candidate-1"]);
    });
});
