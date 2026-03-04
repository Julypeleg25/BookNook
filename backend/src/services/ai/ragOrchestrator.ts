import { performSearch } from "./searchService";
import { generateAnswer } from "./generationService";
import { logger } from "@utils/logger";

export interface RAGOptions {
    mode?: "general" | "personalized";
    userId?: string;
    minRating?: number | null;
}

export interface RAGResult {
    answer: string;
    sources: Array<{
        id: string;
        bookId: string;
        type: string;
        text: string;
        score: number;
        metadata: any;
    }>;
}

/**
 * RAG Orchestrator
 *
 * Coordinates embedding, retrieval, context building, and generation.
 */
export const processQuery = async (
    query: string,
    opts: RAGOptions = {}
): Promise<RAGResult> => {
    const { mode = "general", userId, minRating = null } = opts;

    try {
        const { chunks, userProfile } = await performSearch(query, {
            mode,
            userId,
            minRating,
            topK: 6,
        });


        if (chunks.length === 0 && !userProfile) {
            return {
                answer: "I don't have any relevant books or reviews in the database for that query.",
                sources: [],
            };
        }

        let context = "";

        if (userProfile) {
            context += `--- USER PROFILE ---\n${userProfile}\n\n`;
        }

        context += `--- SEMANTIC SEARCH RESULTS ---\n`;
        context += chunks
            .map((c, i) => `Result #${i + 1} (${c.type}):\n${c.text}`)
            .join("\n\n");

        const answer = await generateAnswer(query, context, { mode });

        return {
            answer,
            sources: chunks.map((c) => ({
                id: c.id,
                bookId: c.bookId,
                type: c.type,
                text: c.text,
                score: c.score,
                metadata: c.metadata,
            })),
        };
    } catch (err) {
        logger.error("[RAGOrchestrator] Failed to process RAG query:", err);
        throw err;
    }
};

