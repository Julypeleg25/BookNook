import { Router } from "express";
import { handleRagQuery } from "@controllers/ragController";
import { securityFilter, ragRateLimiter } from "@middlewares/securityMiddleware";
import { authenticate } from "@middlewares/authMiddleware";

const router = Router();

router.post(
  "/query",
  ragRateLimiter,
  securityFilter,
  authenticate,
  handleRagQuery
);

export default router;
