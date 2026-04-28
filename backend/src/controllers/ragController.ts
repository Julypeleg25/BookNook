import { Request, Response } from "express";
import { processQuery } from "@services/ai/ragOrchestrator";
import { parseRagQueryRequest } from "@utils/ragValidation";
import { logger } from "@utils/logger";
import { ZodError } from "zod";

export const handleRagQuery = async (req: Request, res: Response) => {
  try {
    const { query } = parseRagQueryRequest(req.body);
    const result = await processQuery(query);

    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message ?? "Invalid question." });
    }

    logger.error("[RAG CONTROLLER] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
