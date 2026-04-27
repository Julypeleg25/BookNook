import { pipeline } from "@xenova/transformers";
import { logger } from "@utils/logger";

const EMBEDDING_DIMENSIONS = 384;
const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

let extractor: unknown = null;

const getExtractor = async () => {
    if (!extractor) {
        logger.info("[EmbeddingService] Loading all-MiniLM-L6-v2 pipeline...");
        extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);
        logger.info("[EmbeddingService] Pipeline loaded.");
    }
    return extractor as (text: string, options?: object) => Promise<{ data: Float32Array }>;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    if (!text || text.trim().length === 0) {
        throw new Error("[EmbeddingService] Cannot embed empty text.");
    }

    const extract = await getExtractor();
    const output = await extract(text, { pooling: "mean", normalize: true });
    return Array.from(output.data) as number[];
};


export const generateEmbeddingsBatch = async (
    texts: string[]
): Promise<number[][]> => {
    if (texts.length === 0) return [];

    const extract = await getExtractor();
    const results: number[][] = [];

    for (const text of texts) {
        if (!text || text.trim().length === 0) {
            // pad with zeros instead of crashing the whole batch
            logger.warn("[EmbeddingService] Skipped empty text in batch — using zero vector.");
            results.push(new Array(EMBEDDING_DIMENSIONS).fill(0));
            continue;
        }
        const output = await extract(text, { pooling: "mean", normalize: true });
        results.push(Array.from(output.data) as number[]);
    }

    return results;
};
