import { Pool, PoolClient } from "pg";
import { ENV } from "@config/config";
import { logger } from "@utils/logger";

export type ChunkType = "book" | "review" | "profile";

export interface VectorChunk {
    sourceId: string;
    bookId: string;
    type: ChunkType;
    text: string;
    embedding: number[];
    rating?: number | null;
    metadata?: Record<string, unknown>;
}

export interface SearchOptions {
    topK?: number;
    typeFilter?: ChunkType | null;
    minRating?: number | null;
    userId?: string | null;
}

export interface SearchResult {
    id: string;
    bookId: string;
    type: ChunkType;
    text: string;
    rating: number | null;
    metadata: Record<string, unknown> | null;
    score: number;
}

let pool: Pool | null = null;

export const getPool = (): Pool => {
    if (!pool) {
        if (!ENV.PGVECTOR_URL) {
            throw new Error("[VectorRepository] PGVECTOR_URL is not configured.");
        }
        pool = new Pool({ connectionString: ENV.PGVECTOR_URL });

        pool.on("error", (err) => {
            logger.error("[VectorRepository] Unexpected pool error:", err);
        });
    }
    return pool;
};


export const ensureSchema = async (): Promise<void> => {
    const client = await getPool().connect();
    try {
        await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
        await client.query(`
      CREATE TABLE IF NOT EXISTS vector_search (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id   TEXT NOT NULL UNIQUE,
        book_id     TEXT NOT NULL,
        type        TEXT NOT NULL,
        text        TEXT NOT NULL,
        embedding   vector(384),
        rating      NUMERIC(3,1),
        metadata    JSONB,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

        await client.query(`
      ALTER TABLE vector_search DROP CONSTRAINT IF EXISTS vector_search_type_check;
      ALTER TABLE vector_search ADD CONSTRAINT vector_search_type_check CHECK (type IN ('book', 'review', 'profile'));
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS vector_search_embedding_hnsw
        ON vector_search
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS vector_search_type_idx    ON vector_search (type);
      CREATE INDEX IF NOT EXISTS vector_search_source_id_idx ON vector_search (source_id);
      CREATE INDEX IF NOT EXISTS vector_search_book_id_idx ON vector_search (book_id);
      CREATE INDEX IF NOT EXISTS vector_search_rating_idx  ON vector_search (rating);
      CREATE INDEX IF NOT EXISTS vector_search_metadata_user_idx ON vector_search ((metadata->>'userId'));
      CREATE INDEX IF NOT EXISTS vector_search_metadata_type_idx ON vector_search ((metadata->>'type'));
    `);
        logger.info("[VectorRepository] Schema verified.");
    } finally {
        client.release();
    }
};

export const upsertChunk = async (chunk: VectorChunk): Promise<void> => {
    const client = await getPool().connect();
    try {
        await client.query(
            `INSERT INTO vector_search
         (source_id, book_id, type, text, embedding, rating, metadata, updated_at)
       VALUES ($1, $2, $3, $4, $5::vector, $6, $7, NOW())
       ON CONFLICT (source_id) DO UPDATE SET
         book_id    = EXCLUDED.book_id,
         type       = EXCLUDED.type,
         text       = EXCLUDED.text,
         embedding  = EXCLUDED.embedding,
         rating     = EXCLUDED.rating,
         metadata   = EXCLUDED.metadata,
         updated_at = NOW();`,
            [
                chunk.sourceId,
                chunk.bookId,
                chunk.type,
                chunk.text,
                JSON.stringify(chunk.embedding),
                chunk.rating ?? null,
                chunk.metadata ? JSON.stringify(chunk.metadata) : null,
            ]
        );
    } finally {
        client.release();
    }
};

export const upsertChunksBatch = async (
    chunks: VectorChunk[],
    batchSize = 50
): Promise<void> => {
    if (chunks.length === 0) return;

    const db = getPool();

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const client: PoolClient = await db.connect();
        try {
            await client.query("BEGIN");

            for (const chunk of batch) {
                await client.query(
                    `INSERT INTO vector_search
             (source_id, book_id, type, text, embedding, rating, metadata, updated_at)
           VALUES ($1, $2, $3, $4, $5::vector, $6, $7, NOW())
           ON CONFLICT (source_id) DO UPDATE SET
             book_id    = EXCLUDED.book_id,
             type       = EXCLUDED.type,
             text       = EXCLUDED.text,
             embedding  = EXCLUDED.embedding,
             rating     = EXCLUDED.rating,
             metadata   = EXCLUDED.metadata,
             updated_at = NOW();`,
                    [
                        chunk.sourceId,
                        chunk.bookId,
                        chunk.type,
                        chunk.text,
                        JSON.stringify(chunk.embedding),
                        chunk.rating ?? null,
                        chunk.metadata ? JSON.stringify(chunk.metadata) : null,
                    ]
                );
            }

            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
};
export const deleteChunkBySourceId = async (sourceId: string): Promise<void> => {
    const client = await getPool().connect();
    try {
        await client.query("DELETE FROM vector_search WHERE source_id = $1;", [sourceId]);
    } finally {
        client.release();
    }
};

export const fetchChunksByMetadata = async (
    filters: Record<string, string>
): Promise<SearchResult[]> => {
    const client = await getPool().connect();
    try {
        let query = `SELECT id, book_id, type, text, rating, metadata, 1.0 as score FROM vector_search WHERE 1=1`;
        const values: unknown[] = [];
        let i = 1;

        for (const [key, val] of Object.entries(filters)) {
            query += ` AND metadata->>'${key}' = $${i++}`;
            values.push(val);
        }

        const result = await client.query(query, values);
        return result.rows.map(row => ({
            id: row.id,
            bookId: row.book_id,
            type: row.type,
            text: row.text,
            rating: row.rating !== null ? parseFloat(row.rating) : null,
            metadata: row.metadata,
            score: 1.0
        }));
    } finally {
        client.release();
    }
};

export const similaritySearch = async (
    embedding: number[],
    opts: SearchOptions = {}
): Promise<SearchResult[]> => {
    const { topK = 8, typeFilter = null, minRating = null, userId = null } = opts;

    const client = await getPool().connect();
    try {
        let whereClause = `WHERE 1=1`;
        const params: (string | number | null)[] = [JSON.stringify(embedding)];
        let pIdx = 2;

        if (typeFilter) {
            whereClause += ` AND type = $${pIdx++}`;
            params.push(typeFilter);
        }
        if (minRating !== null) {
            whereClause += ` AND rating >= $${pIdx++}`;
            params.push(minRating);
        }
        if (userId) {
            whereClause += ` AND metadata->>'userId' = $${pIdx++}`;
            params.push(userId);
        }

        const result = await client.query<{
            id: string;
            book_id: string;
            type: ChunkType;
            text: string;
            rating: string | null;
            metadata: Record<string, unknown> | null;
            score: string;
        }>(
            `SELECT id,
              book_id,
              type,
              text,
              rating,
              metadata,
              1 - (embedding <=> $1::vector) AS score
       FROM   vector_search
       ${whereClause}
       ORDER  BY embedding <=> $1::vector
       LIMIT $${pIdx};`,
            [...params, topK]
        );

        return result.rows.map((row) => ({
            id: row.id,
            bookId: row.book_id,
            type: row.type,
            text: row.text,
            rating: row.rating !== null ? parseFloat(row.rating) : null,
            metadata: row.metadata ?? null,
            score: parseFloat(row.score),
        }));
    } finally {
        client.release();
    }
};
