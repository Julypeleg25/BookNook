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
    mode: "general" | "personalized";
    sourceCount: number;
    sources: Array<{
        id: string;
        bookId: string;
        type: string;
        text: string;
        score: number;
        metadata: Record<string, unknown>;
    }>;
}

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

        if (chunks.length === 0) {
            return {
                answer: "I could not find enough matching BookNook knowledge to answer this well. Try asking about a genre, author, theme, or a more specific kind of book.",
                mode,
                sourceCount: 0,
                sources: [],
            };
        }

        const context = `
<USER_PROFILE>
${userProfile}
</USER_PROFILE>

<GLOBAL_KNOWLEDGE>
${chunks.map((c, i) => `[Result #${i + 1}] type: ${c.type}, authorId: ${c.metadata?.userId || 'system'}\nContent: ${c.text}`).join("\n\n")}
</GLOBAL_KNOWLEDGE>
`.trim();

        const answer = await generateAnswer(query, context, { mode });

        return {
            answer,
            mode,
            sourceCount: chunks.length,
            sources: chunks.map((c) => ({
                id: c.id,
                bookId: c.bookId,
                type: c.type,
                text: c.text,
                score: c.score,
                metadata: c.metadata || {},
            })),
        };
    } catch (err) {
        logger.error("[RAGOrchestrator] Failed to process RAG query:", err);
        throw err;
    }
};
