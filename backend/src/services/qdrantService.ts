import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTIONS = {
  BOOKS: "books",
  USERREVIEWS: "userreviews",
};

/**
 * Initialize Qdrant Collections
 */
export const initCollections = async () => {
  const collections = await client.getCollections();
  const names = collections.collections.map((c) => c.name);

  if (!names.includes(COLLECTIONS.BOOKS)) {
    await client.createCollection(COLLECTIONS.BOOKS, {
      vectors: { size: 1536, distance: "Cosine" },
    });
  }

  if (!names.includes(COLLECTIONS.USERREVIEWS)) {
    await client.createCollection(COLLECTIONS.USERREVIEWS, {
      vectors: { size: 1536, distance: "Cosine" },
    });
  }
};

/**
 * Upsert points to Qdrant
 */
export const upsertData = async (collection: string, points: any[]) => {
  return client.upsert(collection, {
    wait: true,
    points,
  });
};

/**
 * Search with filtering
 */
export const vectorSearch = async (
  collection: string,
  vector: number[],
  limit: number = 5,
  filter: any = null
) => {
  return client.search(collection, {
    vector,
    limit,
    filter,
    with_payload: true,
  });
};
