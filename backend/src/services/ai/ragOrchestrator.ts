import { performSearch } from "./searchService";
import { generateAnswer } from "./generationService";
import { logger } from "@utils/logger";
import { RagQueryRequestSchema } from "@utils/ragValidation";
import { SearchResult } from "./vectorRepository";

const MAX_CONTEXT_CHARS = 3000;
const MAX_SNIPPET_CHARS = 550;
const RAG_SEARCH_TOP_K = 6;
const MAX_TASTE_SIGNAL_COUNT = 6;
const SAFE_STRING_METADATA_LENGTH = 200;
const SAFE_ARRAY_METADATA_ITEM_LENGTH = 80;
const SAFE_ARRAY_METADATA_ITEM_COUNT = 8;
const SECTION_SEPARATOR = "\n\n";
const LINE_SEPARATOR = "\n";
const REDACTED_TOKEN = "[redacted]";
const REMOVED_UNSAFE_INSTRUCTION_TOKEN = "[removed unsafe instruction]";
const DEFAULT_TITLE = "Untitled";
const DEFAULT_AUTHORS = "Unknown author";
const DEFAULT_TASTE_SIGNAL_TITLE = "Reading signal";
const FALLBACK_ANSWER = "I couldn't find enough relevant information in our collection to answer your specific request. Please try a different query or topic.";

const TASTE_SIGNAL_SECTION_TITLE = "CURRENT_USER_TASTE_SIGNALS:";
const CANDIDATE_SECTION_TITLE = "CANDIDATE_BOOKS_AND_REVIEWS:";
const TASTE_SIGNAL_SECTION_INSTRUCTION = "Use only these signals to infer the current user's taste. Do not attribute candidate reviews from other users to this user.";
const CANDIDATE_SECTION_INSTRUCTION = "Use these only to choose and describe possible recommendations.";

const PERSONALIZED_QUERY_PHRASES = [
    "for me",
    "based on my taste",
    "my recommendations",
    "what should i read",
    "give me books i'll like",
    "give me books i’ll like",
    "books i'll like",
    "books i’ll like",
    "recommendations for me",
] as const;

const METADATA_KEYS = {
    title: "title",
    bookTitle: "bookTitle",
    authors: "authors",
    genres: "genres",
    rating: "rating",
    username: "username",
    externalId: "externalId",
} as const;

const SENSITIVE_CONTEXT_PATTERN = /(api[_-]?key|token|secret|password|bearer\s+[a-z0-9._-]+|postgres(?:ql)?:\/\/\S+|mongodb(?:\+srv)?:\/\/\S+|https?:\/\/(?:localhost|127\.0\.0\.1|10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)\S+)/gi;
const PROMPT_INJECTION_PATTERN = /(ignore (?:all )?(?:previous|prior|above) instructions|system prompt|developer message|reveal (?:the )?(?:prompt|instructions|secrets)|act as|jailbreak)/gi;
const REGEX_SPECIAL_CHAR_PATTERN = /[.*+?^${}()|[\]\\]/g;
const PERSONALIZED_QUERY_PATTERN = new RegExp(
    `\\b(${PERSONALIZED_QUERY_PHRASES.map((phrase) => phrase.replace(REGEX_SPECIAL_CHAR_PATTERN, "\\$&")).join("|")})\\b`,
    "i",
);
const CONTROL_CHAR_MAX_CODE = 31;
const DELETE_CHAR_CODE = 127;

export interface RAGOptions {
    userId?: string;
}

export interface RAGResult {
    answer: string;
    sourceCount: number;
    sources: Array<{
        id: string;
        bookId: string;
        type: string;
        score: number;
        metadata: Record<string, unknown>;
    }>;
}

export const isPersonalizedRecommendationQuery = (query: string): boolean =>
    PERSONALIZED_QUERY_PATTERN.test(query);

const replaceControlCharacters = (value: string): string =>
    Array.from(value)
        .map((char) => {
            const charCode = char.charCodeAt(0);
            return charCode <= CONTROL_CHAR_MAX_CODE || charCode === DELETE_CHAR_CODE ? " " : char;
        })
        .join("");

const normalizeText = (value: string): string =>
    replaceControlCharacters(value)
        .replace(SENSITIVE_CONTEXT_PATTERN, REDACTED_TOKEN)
        .replace(PROMPT_INJECTION_PATTERN, REMOVED_UNSAFE_INSTRUCTION_TOKEN)
        .replace(/\s+/g, " ")
        .trim();

const sanitizeMetadata = (metadata: Record<string, unknown> | null): Record<string, unknown> => {
    if (!metadata) return {};

    const safeKeys = Object.values(METADATA_KEYS);
    return safeKeys.reduce<Record<string, unknown>>((safeMetadata, key) => {
        const value = metadata[key];
        if (typeof value === "string") {
            safeMetadata[key] = normalizeText(value).slice(0, SAFE_STRING_METADATA_LENGTH);
        } else if (typeof value === "number" || typeof value === "boolean") {
            safeMetadata[key] = value;
        } else if (Array.isArray(value)) {
            safeMetadata[key] = value
                .filter((item): item is string => typeof item === "string")
                .map((item) => normalizeText(item).slice(0, SAFE_ARRAY_METADATA_ITEM_LENGTH))
                .slice(0, SAFE_ARRAY_METADATA_ITEM_COUNT);
        }
        return safeMetadata;
    }, {});
};

const sanitizeAndDeduplicateChunks = (chunks: SearchResult[]): SearchResult[] => {
    const seenTexts = new Set<string>();

    return chunks.reduce<SearchResult[]>((safeChunks, chunk) => {
        const sanitizedText = normalizeText(chunk.text).slice(0, MAX_SNIPPET_CHARS);
        const dedupeKey = sanitizedText.toLowerCase();

        if (!sanitizedText || seenTexts.has(dedupeKey)) {
            return safeChunks;
        }

        seenTexts.add(dedupeKey);
        safeChunks.push({
            ...chunk,
            text: sanitizedText,
            metadata: sanitizeMetadata(chunk.metadata),
        });

        return safeChunks;
    }, []);
};

const getStringMetadata = (
    metadata: Record<string, unknown> | null,
    key: string,
    fallback: string,
): string => {
    const value = metadata?.[key];
    return typeof value === "string" && value.trim() ? value : fallback;
};

const buildTasteEvidence = (chunks: SearchResult[]): string =>
    chunks
        .slice(0, MAX_TASTE_SIGNAL_COUNT)
        .map((chunk, index) => {
            const title = getStringMetadata(
                chunk.metadata,
                METADATA_KEYS.title,
                getStringMetadata(chunk.metadata, METADATA_KEYS.bookTitle, DEFAULT_TASTE_SIGNAL_TITLE),
            );
            const rating = typeof chunk.metadata?.[METADATA_KEYS.rating] === "number"
                ? `rating: ${chunk.metadata[METADATA_KEYS.rating]}`
                : "";

            return [
                `[Taste Signal ${index + 1}]`,
                `type: ${chunk.type}`,
                `title: ${title}`,
                rating,
                `content: ${chunk.text}`,
            ].filter(Boolean).join(LINE_SEPARATOR);
        })
        .join(SECTION_SEPARATOR);

const buildCandidateSnippet = (chunk: SearchResult, index: number): string => {
    const title = getStringMetadata(chunk.metadata, METADATA_KEYS.title, DEFAULT_TITLE);
    const authorsValue = chunk.metadata?.[METADATA_KEYS.authors];
    const authors = Array.isArray(authorsValue) ? authorsValue.join(", ") : DEFAULT_AUTHORS;

    return [
        `[Snippet ${index + 1}]`,
        `type: ${chunk.type}`,
        `title: ${title}`,
        `authors: ${authors}`,
        `content: ${chunk.text}`,
    ].join(LINE_SEPARATOR);
};

const buildPromptContext = (
    chunks: SearchResult[],
    opts: { personalized: boolean; userTasteChunks: SearchResult[] }
): string => {
    let context = "";
    const sections: string[] = [];

    if (opts.personalized && opts.userTasteChunks.length > 0) {
        sections.push([
            TASTE_SIGNAL_SECTION_TITLE,
            TASTE_SIGNAL_SECTION_INSTRUCTION,
            buildTasteEvidence(opts.userTasteChunks),
        ].join(LINE_SEPARATOR));
    }

    const candidateSnippets: string[] = [];
    for (const [index, chunk] of chunks.entries()) {
        const nextSnippet = buildCandidateSnippet(chunk, index);
        const nextCandidateBlock = candidateSnippets.length > 0
            ? `${candidateSnippets.join(SECTION_SEPARATOR)}${SECTION_SEPARATOR}${nextSnippet}`
            : nextSnippet;

        if (nextCandidateBlock.length > MAX_CONTEXT_CHARS) {
            break;
        }

        candidateSnippets.push(nextSnippet);
    }

    sections.push([
        CANDIDATE_SECTION_TITLE,
        CANDIDATE_SECTION_INSTRUCTION,
        candidateSnippets.join(SECTION_SEPARATOR),
    ].join(LINE_SEPARATOR));

    for (const section of sections) {
        const nextContext = context ? `${context}${SECTION_SEPARATOR}${section}` : section;

        if (nextContext.length > MAX_CONTEXT_CHARS) {
            if (!context) {
                context = section.slice(0, MAX_CONTEXT_CHARS).trim();
            }
            break;
        }

        context = nextContext;
    }

    return context;
};

export const processQuery = async (
    query: string,
    opts: RAGOptions = {}
): Promise<RAGResult> => {
    try {
        const { query: validatedQuery } = RagQueryRequestSchema.parse({ query });
        const personalized = Boolean(opts.userId && isPersonalizedRecommendationQuery(validatedQuery));
        const { candidateChunks, userTasteChunks } = await performSearch(validatedQuery, {
            topK: RAG_SEARCH_TOP_K,
            userId: opts.userId,
            personalized,
        });
        const safeChunks = sanitizeAndDeduplicateChunks(candidateChunks);
        const safeUserTasteChunks = sanitizeAndDeduplicateChunks(userTasteChunks);

        logger.info("[RAGOrchestrator] Search summary", {
            query: validatedQuery,
            personalized,
            candidateChunks: candidateChunks.length,
            userTasteChunks: userTasteChunks.length,
            safeChunks: safeChunks.length,
            safeUserTasteChunks: safeUserTasteChunks.length,
        });

        if (safeChunks.length === 0) {
            return {
                answer: FALLBACK_ANSWER,
                sourceCount: 0,
                sources: [],
            };
        }

        const context = buildPromptContext(safeChunks, {
            personalized,
            userTasteChunks: safeUserTasteChunks,
        });

        if (!context) {
            return {
                answer: FALLBACK_ANSWER,
                sourceCount: 0,
                sources: [],
            };
        }

        const answer = await generateAnswer(validatedQuery, context, { personalized });

        return {
            answer,
            sourceCount: safeChunks.length,
            sources: safeChunks.map((c) => ({
                id: c.id,
                bookId: c.bookId,
                type: c.type,
                score: c.score,
                metadata: c.metadata || {},
            })),
        };
    } catch (err) {
        logger.error("[RAGOrchestrator] Failed to process RAG query:", err);
        throw err;
    }
};
