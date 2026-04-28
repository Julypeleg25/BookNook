import {
    ChunkType,
    fetchChunksByMetadata,
    similaritySearch,
    SearchResult
} from "./vectorRepository";
import { generateEmbedding } from "./embeddingService";
import User from "@models/User";

const DEFAULT_SEARCH_TOP_K = 8;
const USER_LIST_FIELDS = "readlist wishlist";
const PROFILE_METADATA_TYPE = "profile";
const REVIEW_CHUNK_TYPE: ChunkType = "review";
const BOOK_CHUNK_TYPE: ChunkType = "book";
const USER_ID_METADATA_KEY = "userId";
const EXTERNAL_ID_METADATA_KEY = "externalId";

export interface SearchOptions {
    topK?: number;
    userId?: string;
    personalized?: boolean;
}

export interface SearchResponse {
    candidateChunks: SearchResult[];
    userTasteChunks: SearchResult[];
    readExternalIds: string[];
}

const getStringMetadataValue = (
    metadata: Record<string, unknown> | null,
    key: string
): string | null => {
    const value = metadata?.[key];
    return typeof value === "string" && value.trim() ? value : null;
};

export const performSearch = async (
    query: string,
    opts: SearchOptions
): Promise<SearchResponse> => {
    const { topK = DEFAULT_SEARCH_TOP_K, userId, personalized = false } = opts;
    const userTasteChunks: SearchResult[] = [];
    const readExternalIds = new Set<string>();

    if (personalized && userId) {
        const [profileChunks, userChunks, user] = await Promise.all([
            fetchChunksByMetadata({ [USER_ID_METADATA_KEY]: userId, type: PROFILE_METADATA_TYPE }),
            fetchChunksByMetadata({ userId }),
            User.findById(userId).select(USER_LIST_FIELDS).lean(),
        ]);

        profileChunks.forEach((chunk) => userTasteChunks.push(chunk));
        userChunks
            .filter((chunk) => chunk.type === REVIEW_CHUNK_TYPE && getStringMetadataValue(chunk.metadata, USER_ID_METADATA_KEY) === userId)
            .forEach((chunk) => {
                userTasteChunks.push(chunk);
                const externalId = getStringMetadataValue(chunk.metadata, EXTERNAL_ID_METADATA_KEY);
                if (externalId) readExternalIds.add(externalId);
            });

        user?.readlist?.forEach((externalId) => readExternalIds.add(externalId));
    }

    const queryEmbedding = await generateEmbedding(query);

    const searchResults = await similaritySearch(queryEmbedding, {
        topK,
        typeFilter: null,
        excludeExternalIds: readExternalIds.size > 0 ? Array.from(readExternalIds) : null,
    });

    return {
        candidateChunks: searchResults.filter((result) => result.type === BOOK_CHUNK_TYPE || result.type === REVIEW_CHUNK_TYPE),
        userTasteChunks,
        readExternalIds: Array.from(readExternalIds),
    };
};
