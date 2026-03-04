/**
 * aiService.ts — UPDATED
 *
 * This file is now a thin compatibility shim.
 *
 * - Embedding: delegated to embeddingService (all-MiniLM-L6-v2)
 * - Text generation: removed (TinyLlama replaced by OpenAI in generationService)
 *
 * Import directly from the sub-services for new code:
 *   import { generateEmbedding } from "@services/ai/embeddingService"
 *   import { generateAnswer }    from "@services/ai/generationService"
 */

// Re-export so any legacy import of generateEmbedding from aiService still compiles.
export { generateEmbedding, generateEmbeddingsBatch } from "@services/ai/embeddingService";
