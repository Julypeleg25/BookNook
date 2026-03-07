/**
 * @swagger
 * /api/rag/query:
 *   post:
 *     summary: Query RAG (Retrieval-Augmented Generation)
 *     tags: [RAG]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: The user query for RAG
 *     responses:
 *       200:
 *         description: RAG response
 */
import { Router } from "express";
import { handleRagQuery } from "@controllers/ragController";
import { securityFilter, ragRateLimiter } from "@middlewares/securityMiddleware";
import { optionalAuthenticate } from "@middlewares/authMiddleware";

const router = Router();

router.post(
  "/query",
  ragRateLimiter,
  securityFilter,
  optionalAuthenticate,
  handleRagQuery
);

export default router;
