import { jest } from "@jest/globals";

interface GeminiTestResult {
    response: {
        text: () => string;
    };
}

const mockGenerateContent = jest.fn<(prompt: string) => Promise<GeminiTestResult>>();
const mockGetGenerativeModel = jest.fn();
let capturedPrompt = "";

jest.unstable_mockModule("@google/generative-ai", () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: mockGetGenerativeModel,
    })),
}));

jest.unstable_mockModule("@config/config", () => ({
    ENV: {
        GEMINI_API_KEY: "test-key",
    },
}));

jest.unstable_mockModule("@utils/logger", () => ({
    logger: {
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

const { generateAnswer } = await import("@services/ai/generationService");

describe("generation service response rules", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedPrompt = "";
        mockGetGenerativeModel.mockReturnValue({
            generateContent: mockGenerateContent,
        });
        mockGenerateContent.mockImplementation((prompt: string) => {
            capturedPrompt = prompt;
            return Promise.resolve({
                response: {
                    text: () => [
                        "Try The Guest List by Lucy Foley for a tense mystery with a closed-circle setup.",
                        "Would you like more recommendations?",
                    ].join("\n"),
                },
            });
        });
    });

    it("removes follow-up questions from model responses", async () => {
        const answer = await generateAnswer(
            "What should I read?",
            "CURRENT_USER_TASTE_SIGNALS:\nLikes atmospheric mysteries.",
            { personalized: true },
        );

        expect(answer).toContain("Try The Guest List");
        expect(answer).not.toContain("Would you like");
        expect(answer.endsWith("?")).toBe(false);
    });

    it("adds personalized prompt rules without comparing multiple users", async () => {
        await generateAnswer(
            "Give me books I'll like",
            "CURRENT_USER_TASTE_SIGNALS:\nLikes clever reveals.",
            { personalized: true },
        );

        expect(capturedPrompt).toContain("Infer one clear taste profile");
        expect(capturedPrompt).toContain("Do not describe multiple readers or profiles");
        expect(capturedPrompt).toContain("Recommend 3-5 books the user likely has not read");
    });

    it("falls back safely when the model mentions information limitations", async () => {
        mockGenerateContent.mockResolvedValueOnce({
            response: {
                text: () => "Based on limited context, I do not have enough information.",
            },
        });

        const answer = await generateAnswer("My recommendations", "Some candidate books.", { personalized: true });

        expect(answer).not.toMatch(/limited context|not enough information/i);
        expect(answer.endsWith("?")).toBe(false);
    });
});
