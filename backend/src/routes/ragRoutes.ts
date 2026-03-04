import { Router } from "express";
import { handleRagQuery } from "@controllers/ragController";
import { securityFilter, ragRateLimiter } from "@middlewares/securityMiddleware";
import { optionalAuthenticate } from "@middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/rag/query:
 *   post:
 *     summary: Query the RAG system
 *     tags: [RAG]
 */

router.post(
  "/query",
  ragRateLimiter,
  securityFilter,
  optionalAuthenticate,
  handleRagQuery
);

export default router;
