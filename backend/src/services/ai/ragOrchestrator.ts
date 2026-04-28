import { performSearch } from "./searchService";
import { generateAnswer } from "./generationService";
import { logger } from "@utils/logger";
import { RagQueryRequestSchema } from "@utils/ragValidation";
import { SearchResult } from "./vectorRepository";

const MAX_CONTEXT_CHARS = 6000;
const MAX_SNIPPET_CHARS = 900;
const FALLBACK_ANSWER = "For a good mystery pick, try something with a sharp central puzzle, a tense atmosphere, and secrets that unfold piece by piece. A twisty psychological mystery or a classic locked-room story is a great place to start.";
const SENSITIVE_CONTEXT_PATTERN = /(api[_-]?key|token|secret|password|bearer\s+[a-z0-9._-]+|postgres(?:ql)?:\/\/\S+|mongodb(?:\+srv)?:\/\/\S+|https?:\/\/(?:localhost|127\.0\.0\.1|10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)\S+)/gi;
const PROMPT_INJECTION_PATTERN = /(ignore (?:all )?(?:previous|prior|above) instructions|system prompt|developer message|reveal (?:the )?(?:prompt|instructions|secrets)|act as|jailbreak)/gi;

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

const normalizeText = (value: string): string =>
    value
        .replace(SENSITIVE_CONTEXT_PATTERN, "[redacted]")
        .replace(PROMPT_INJECTION_PATTERN, "[removed unsafe instruction]")
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const sanitizeMetadata = (metadata: Record<string, unknown> | null): Record<string, unknown> => {
    if (!metadata) return {};

    const safeKeys = ["title", "authors", "genres", "rating", "username", "externalId"];
    return safeKeys.reduce<Record<string, unknown>>((safeMetadata, key) => {
        const value = metadata[key];
        if (typeof value === "string") {
            safeMetadata[key] = normalizeText(value).slice(0, 200);
        } else if (typeof value === "number" || typeof value === "boolean") {
            safeMetadata[key] = value;
        } else if (Array.isArray(value)) {
            safeMetadata[key] = value
                .filter((item): item is string => typeof item === "string")
                .map((item) => normalizeText(item).slice(0, 80))
                .slice(0, 8);
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

const buildPromptContext = (chunks: SearchResult[]): string => {
    let context = "";

    for (const [index, chunk] of chunks.entries()) {
        const title = typeof chunk.metadata?.title === "string" ? chunk.metadata.title : "Untitled";
        const authors = Array.isArray(chunk.metadata?.authors) ? chunk.metadata.authors.join(", ") : "Unknown author";
        const snippet = [
            `[Snippet ${index + 1}]`,
            `type: ${chunk.type}`,
            `title: ${title}`,
            `authors: ${authors}`,
            `content: ${chunk.text}`,
        ].join("\n");

        if ((context + "\n\n" + snippet).length > MAX_CONTEXT_CHARS) {
            break;
        }

        context = context ? `${context}\n\n${snippet}` : snippet;
    }

    return context;
};

export const processQuery = async (
    query: string
): Promise<RAGResult> => {
    try {
        const { query: validatedQuery } = RagQueryRequestSchema.parse({ query });
        const chunks = await performSearch(validatedQuery, {
            topK: 6,
        });
        const safeChunks = sanitizeAndDeduplicateChunks(chunks);

        if (safeChunks.length === 0) {
            return {
                answer: FALLBACK_ANSWER,
                sourceCount: 0,
                sources: [],
            };
        }

        const context = buildPromptContext(safeChunks);

        if (!context) {
            return {
                answer: FALLBACK_ANSWER,
                sourceCount: 0,
                sources: [],
            };
        }

        const answer = await generateAnswer(validatedQuery, context);

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
