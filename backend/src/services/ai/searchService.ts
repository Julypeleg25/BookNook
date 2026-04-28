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

export const performSearch = async (
    query: string,
    opts: SearchOptions
): Promise<{ chunks: SearchResult[]; userProfile: string }> => {
    const { mode, userId, minRating, topK = 8 } = opts;

    let userProfileText = "";

    if (mode === "personalized") {
        if (userId) {
            const profileChunks = await fetchChunksByMetadata({
                userId,
                type: "profile"
            });

            if (profileChunks.length > 0) {
                userProfileText = profileChunks[0].text;
            } else {
                userProfileText = "NEW_USER: This user has no history or preferences yet.";
            }
        } else {
            userProfileText = "GUEST_USER: No user identity provided.";
        }
    } else {
        userProfileText = "GENERAL_MODE: Profile context omitted for global search.";
    }

    const queryEmbedding = await generateEmbedding(query);

    const searchResults = await similaritySearch(queryEmbedding, {
        topK,
        minRating,
        typeFilter: null
    });

    const validChunks = searchResults.filter(r => r.type === "book" || r.type === "review");

    return {
        chunks: validChunks,
        userProfile: userProfileText
    };
};
