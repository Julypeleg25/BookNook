import {
    ChunkType,
    fetchChunksByMetadata,
    similaritySearch,
    SearchResult
} from "./vectorRepository";
import { generateEmbedding } from "./embeddingService";

const DEFAULT_SEARCH_TOP_K = 4;
const PROFILE_METADATA_TYPE = "profile";
const REVIEW_CHUNK_TYPE: ChunkType = "review";
const BOOK_CHUNK_TYPE: ChunkType = "book";
const USER_ID_METADATA_KEY = "userId";
const EXTERNAL_ID_METADATA_KEY = "externalId";
const MIN_SEARCH_SCORE = 0.35;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/g;
const WHITESPACE_PATTERN = /\s+/g;

export interface SearchOptions {
    topK?: number;
    userId?: string;
    personalized?: boolean;
}

export interface SearchResponse {
    candidateChunks: SearchResult[];
    userTasteChunks: SearchResult[];
}

const getStringMetadataValue = (
    metadata: Record<string, unknown> | null,
    key: string
): string | null => {
    const value = metadata?.[key];
    return typeof value === "string" && value.trim() ? value : null;
};

const normalizeQuery = (query: string): string =>
    query
        .replace(CONTROL_CHARACTER_PATTERN, " ")
        .replace(WHITESPACE_PATTERN, " ")
        .trim();

export const performSearch = async (
    query: string,
    opts: SearchOptions
): Promise<SearchResponse> => {
    const { topK = DEFAULT_SEARCH_TOP_K, userId, personalized = false } = opts;
    const userTasteChunks: SearchResult[] = [];
    const excludedExternalIds = new Set<string>();

    if (personalized && userId) {
        const [profileChunks, userChunks] = await Promise.all([
            fetchChunksByMetadata({ [USER_ID_METADATA_KEY]: userId, type: PROFILE_METADATA_TYPE }),
            fetchChunksByMetadata({ userId }),
        ]);

        profileChunks.forEach((chunk) => userTasteChunks.push(chunk));
        userChunks
            .filter((chunk) => chunk.type === REVIEW_CHUNK_TYPE && getStringMetadataValue(chunk.metadata, USER_ID_METADATA_KEY) === userId)
            .forEach((chunk) => {
                userTasteChunks.push(chunk);
                const externalId = getStringMetadataValue(chunk.metadata, EXTERNAL_ID_METADATA_KEY);
                if (externalId) excludedExternalIds.add(externalId);
            });
    }

    const queryEmbedding = await generateEmbedding(normalizeQuery(query));

    const searchResults = await similaritySearch(queryEmbedding, {
        topK,
        typeFilter: null,
        excludeExternalIds: excludedExternalIds.size > 0 ? Array.from(excludedExternalIds) : null,
    });

    return {
        candidateChunks: searchResults.filter(
            (result) =>
                result.score >= MIN_SEARCH_SCORE &&
                (result.type === BOOK_CHUNK_TYPE || result.type === REVIEW_CHUNK_TYPE),
        ),
        userTasteChunks,
    };
};
