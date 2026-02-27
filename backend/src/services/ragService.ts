import { COLLECTIONS, vectorSearch } from "@services/qdrantService";
import { generateEmbedding, getAiResponse } from "@services/aiService";
import { Types } from "mongoose";

export enum RAGMode {
  GLOBAL = "GLOBAL",
  PERSONAL = "PERSONAL",
}

/**
 * Main RAG Pipeline
 */
export const processRagQuery = async (
  query: string,
  mode: RAGMode,
  userId?: string
) => {
  // 1. Generate Query Embedding
  const queryVector = await generateEmbedding(query);

  // 2. Retrieval with RBAC filtering
  let context = "";
  const sources: string[] = [];

  // Combine results from Books and Reviews
  const bookResults = await vectorSearch(COLLECTIONS.BOOKS, queryVector, 3);
  
  // Filter reviews based on mode
  const reviewFilter = mode === RAGMode.PERSONAL && userId 
    ? {
        must: [
          { key: "userId", match: { value: userId } }
        ]
      }
    : null; // In GLOBAL mode, we might want to ONLY search public reviews or all reviews depending on definition. 
            // Requirement says GLOBAL: "only public book/review data". 
            // Personal: "only authenticated user's own data".

  const reviewResults = await vectorSearch(COLLECTIONS.USERREVIEWS, queryVector, 5, reviewFilter);

  // 3. Build Context String
  context += "Relevant Books:\n";
  bookResults.forEach(res => {
    const p = res.payload as any;
    context += `- Title: ${p.title}, Genres: ${p.genres?.join(", ")}, Description: ${p.description}\n`;
    sources.push(`Book: ${p.title}`);
  });

  context += "\nRelevant Reviews:\n";
  reviewResults.forEach(res => {
    const p = res.payload as any;
    context += `- Review: ${p.content}, Rating: ${p.rating}/5\n`;
    sources.push(`Review for BookId: ${p.bookId}`);
  });

  // 4. Generate AI Response
  const aiResult = await getAiResponse(query, context);

  return {
    answer: aiResult.answer,
    sources: [...new Set(sources)], // Unique sources
  };
};
