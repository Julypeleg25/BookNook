import {
    similaritySearch,
    SearchResult
} from "./vectorRepository";
import { generateEmbedding } from "./embeddingService";

export interface SearchOptions {
    topK?: number;
}

export const performSearch = async (
    query: string,
    opts: SearchOptions
): Promise<SearchResult[]> => {
    const { topK = 8 } = opts;

    const queryEmbedding = await generateEmbedding(query);

    const searchResults = await similaritySearch(queryEmbedding, {
        topK,
        typeFilter: null,
    });

    return searchResults.filter((result) => result.type === "book" || result.type === "review");
};
