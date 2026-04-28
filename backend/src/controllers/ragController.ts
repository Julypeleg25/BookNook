import { Request, Response } from "express";
import { processQuery } from "@services/ai/ragOrchestrator";
import { buildUserProfileForRag } from "@services/ai/profileService";
import { parseRagQueryRequest } from "@utils/ragValidation";
import { logger } from "@utils/logger";
import { ZodError } from "zod";

export const handleRagQuery = async (req: Request, res: Response) => {
  try {
    const { query, userProfile: providedProfile } = parseRagQueryRequest(req.body);
    const userId = req.authenticatedUser!.id;

    const userProfile = providedProfile || await buildUserProfileForRag(userId);

    const result = await processQuery(query, {
      userId,
      userProfile,
    });

    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message ?? "Invalid question." });
    }

    logger.error("[RAG CONTROLLER] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
