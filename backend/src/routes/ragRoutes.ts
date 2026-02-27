import { Router } from "express";
import { handleRagQuery } from "@controllers/ragController";
import { securityFilter, ragRateLimiter } from "@middlewares/securityMiddleware";
import passport from "passport";

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
  // Optional auth: PERSONAL mode needs it, GLOBAL doesn't. 
  // We'll handle checks in controller or use a custom "optionalAuth" middleware
  passport.authenticate(['jwt', 'session'], { session: false }), 
  handleRagQuery
);

export default router;
