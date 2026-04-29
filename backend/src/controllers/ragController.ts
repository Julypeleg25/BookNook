import { Request, Response } from "express";
import { processQuery } from "@services/ai/ragOrchestrator";
import { parseRagQueryRequest } from "@utils/ragValidation";
import { logger } from "@utils/logger";
import { ZodError } from "zod";

const AI_BUSY_MESSAGE =
  "The AI assistant is busy right now. Please try again later.";

interface ErrorWithStatus {
  status?: number;
  errorDetails?: Array<{ retryDelay?: string }>;
}

const isAIAssistantBusyError = (error: unknown): error is ErrorWithStatus => {
  if (!error || typeof error !== "object") return false;
  const status = "status" in error ? (error as ErrorWithStatus).status : undefined;
  return status === 429 || status === 503;
};

export const handleRagQuery = async (req: Request, res: Response) => {
  try {
    const { query } = parseRagQueryRequest(req.body);
    const result = await processQuery(query, {
      userId: req.authenticatedUser!.id,
    });

    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message ?? "Invalid question." });
    }

    if (isAIAssistantBusyError(error)) {
      const retryDelay = error.errorDetails?.find((detail) => detail.retryDelay)?.retryDelay;

      if (retryDelay) {
        res.setHeader("Retry-After", retryDelay.replace(/s$/, ""));
      }

      logger.warn("[RAG CONTROLLER] AI assistant is busy:", error);
      return res.status(error.status ?? 503).json({ error: AI_BUSY_MESSAGE });
    }

    logger.error("[RAG CONTROLLER] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
