import { jest } from "@jest/globals";
import { SearchResult } from "@services/ai/vectorRepository";

type SearchResponse = {
    candidateChunks: SearchResult[];
    userTasteChunks: SearchResult[];
};

const mockPerformSearch = jest.fn<() => Promise<SearchResponse>>();
const mockGenerateAnswer = jest.fn<() => Promise<string>>();

jest.unstable_mockModule("@services/ai/searchService", () => ({
    performSearch: mockPerformSearch,
}));

jest.unstable_mockModule("@services/ai/generationService", () => ({
    generateAnswer: mockGenerateAnswer,
}));

jest.unstable_mockModule("@utils/logger", () => ({
    logger: {
        error: jest.fn(),
    },
}));

let processQuery: typeof import("@services/ai/ragOrchestrator").processQuery;
let isPersonalizedRecommendationQuery: typeof import("@services/ai/ragOrchestrator").isPersonalizedRecommendationQuery;

const createSearchResult = (
    overrides: Partial<SearchResult>
): SearchResult => ({
    id: "result-1",
    bookId: "book-1",
    type: "book",
    text: "A tense mystery with layered secrets.",
    rating: null,
    metadata: {
        title: "Candidate Mystery",
        authors: ["A. Writer"],
        externalId: "candidate-ext",
    },
    score: 0.9,
    ...overrides,
});

describe("RAG orchestrator personalization", () => {
    beforeAll(async () => {
        ({ processQuery, isPersonalizedRecommendationQuery } = await import("@services/ai/ragOrchestrator"));
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockGenerateAnswer.mockResolvedValue("Try Candidate Mystery by A. Writer. It fits your taste for tense, layered stories.");
    });

    it("detects personalized recommendation requests", () => {
        expect(isPersonalizedRecommendationQuery("What should I read next?")).toBe(true);
        expect(isPersonalizedRecommendationQuery("Give me books I'll like")).toBe(true);
        expect(isPersonalizedRecommendationQuery("Recommend a mystery novel")).toBe(false);
    });

    it("passes the current user ID and current user taste into personalized generation", async () => {
        mockPerformSearch.mockResolvedValue({
            candidateChunks: [
                createSearchResult({
                    id: "candidate-1",
                    text: "Book: Candidate Mystery | Summary: A twisty puzzle.",
                }),
            ],
            userTasteChunks: [
                createSearchResult({
                    id: "taste-1",
                    type: "review",
                    text: "User reviewed Shadow House. Rating: 5/5. Review: I loved the eerie setting and clever reveal.",
                    metadata: {
                        bookTitle: "Shadow House",
                        rating: 5,
                        userId: "user-123",
                        externalId: "reviewed-ext",
                    },
                }),
            ],
        });

        await processQuery("What should I read next?", { userId: "user-123" });

        expect(mockPerformSearch).toHaveBeenCalledWith("What should I read next?", {
            topK: 6,
            userId: "user-123",
            personalized: true,
        });
        expect(mockGenerateAnswer).toHaveBeenCalledWith(
            "What should I read next?",
            expect.stringContaining("CURRENT_USER_TASTE_SIGNALS"),
        );
        expect(mockGenerateAnswer).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining("I loved the eerie setting and clever reveal"),
        );
    });

    it("does not include current user taste signals for non-personalized requests", async () => {
        mockPerformSearch.mockResolvedValue({
            candidateChunks: [createSearchResult({})],
            userTasteChunks: [],
        });

        await processQuery("Recommend a mystery novel", { userId: "user-123" });

        expect(mockPerformSearch).toHaveBeenCalledWith("Recommend a mystery novel", {
            topK: 6,
            userId: "user-123",
            personalized: false,
        });
        expect(mockGenerateAnswer).toHaveBeenCalledWith(
            "Recommend a mystery novel",
            expect.not.stringContaining("CURRENT_USER_TASTE_SIGNALS"),
        );
    });
});
