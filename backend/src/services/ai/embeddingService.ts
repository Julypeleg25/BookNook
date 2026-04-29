import { logger } from "@utils/logger";

const EMBEDDING_DIMENSIONS = 384;
const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

type Extractor = (text: string, options?: object) => Promise<{ data: Float32Array }>;

let extractor: Extractor | null = null;

const getExtractor = async (): Promise<Extractor> => {
    if (!extractor) {
        logger.info("[EmbeddingService] Loading all-MiniLM-L6-v2 pipeline...");
        const transformers = await new Function('return import("@xenova/transformers")')();
        const { pipeline } = transformers;
        extractor = await pipeline("feature-extraction", EMBEDDING_MODEL);
        logger.info("[EmbeddingService] Pipeline loaded.");
    }

    return extractor!;
};

const toEmbedding = (data: Float32Array): number[] => Array.from(data);

export const generateEmbedding = async (text: string): Promise<number[]> => {
    if (!text || text.trim().length === 0) {
        throw new Error("[EmbeddingService] Cannot embed empty text.");
    }

    const extract = await getExtractor();
    const output = await extract(text, { pooling: "mean", normalize: true });
    return toEmbedding(output.data);
};

export const generateEmbeddingsBatch = async (texts: string[]): Promise<number[][]> => {
    if (texts.length === 0) {
        return [];
    }

    const extract = await getExtractor();
    const results: number[][] = [];

    for (const text of texts) {
        if (!text || text.trim().length === 0) {
            logger.warn("[EmbeddingService] Skipped empty text in batch - using zero vector.");
            results.push(new Array(EMBEDDING_DIMENSIONS).fill(0));
            continue;
        }

        const output = await extract(text, { pooling: "mean", normalize: true });
        results.push(toEmbedding(output.data));
    }

    return results;
};
