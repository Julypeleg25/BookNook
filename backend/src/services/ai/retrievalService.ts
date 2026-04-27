import {
    similaritySearch,
    fetchChunksByMetadata,
    SearchResult,
    ChunkType
} from "./vectorRepository";
import { generateEmbedding } from "./embeddingService";

export interface RetrievalOptions {
    mode: "general" | "personalized";
    userId?: string;
    minRating?: number | null;
    topK?: number;
}

export const retrieveChunks = async (
    query: string,
    opts: RetrievalOptions
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

    // general mode, we restrict to books and reviews.
    // personalized mode, we search books/reviews but we've already pulled the profile separately.
    const searchResults = await similaritySearch(queryEmbedding, {
        topK,
        minRating,
        typeFilter: null
    });

    const filteredResults = searchResults.filter(r => r.type !== "profile");

    return {
        chunks: filteredResults,
        userProfile: userProfileText
    };
};
