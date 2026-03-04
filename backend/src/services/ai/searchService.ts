import {
    similaritySearch,
    fetchChunksByMetadata,
    SearchResult
} from "./vectorRepository";
import { generateEmbedding } from "./embeddingService";

export interface SearchOptions {
    mode: "general" | "personalized";
    userId?: string;
    minRating?: number | null;
    topK?: number;
}

/**
 * searchService.ts — Mode-Aware Retrieval Strategy
 *
 * Implements the "Personalized Knowledge Graph" retrieval logic.
 */
export const performSearch = async (
    query: string,
    opts: SearchOptions
): Promise<{ chunks: SearchResult[]; userProfile?: string }> => {
    const { mode, userId, minRating, topK = 8 } = opts;

    let userProfileText = "";

    if (mode === "personalized" && userId) {
        const profileChunks = await fetchChunksByMetadata({
            userId,
            type: "profile"
        });
        if (profileChunks.length > 0) {
            userProfileText = profileChunks[0].text;
        }
    }

    const queryEmbedding = await generateEmbedding(query);


    const searchResults = await similaritySearch(queryEmbedding, {
        topK,
        minRating,
        typeFilter: null // Allows both book and review
    });

    const validChunks = searchResults.filter(r => r.type === "book" || r.type === "review");

    return {
        chunks: validChunks,
        userProfile: userProfileText || undefined
    };
};
