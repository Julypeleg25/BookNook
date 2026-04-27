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
