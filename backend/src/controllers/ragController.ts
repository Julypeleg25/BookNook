import { Request, Response } from "express";
import { processQuery } from "@services/ai/ragOrchestrator";
import { validateRagQuery } from "@utils/ragValidation";

export const handleRagQuery = async (req: Request, res: Response) => {
  try {
    const {
      query,
      minRating,
      mode = "general",
    } = req.body;

    const validation = validateRagQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const userId = (req as any).user?._id?.toString();

    const result = await processQuery(query, {
      mode: mode.toLowerCase() === "personalized" ? "personalized" : "general",
      userId,
      minRating: minRating !== undefined ? Number(minRating) : null,
    });


    res.json(result);
  } catch (error) {
    console.error("[RAG CONTROLLER] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
