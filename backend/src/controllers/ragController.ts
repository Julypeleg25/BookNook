import { Request, Response } from "express";
import { processRagQuery, RAGMode } from "@services/ragService";

/**
 * Handle RAG Query Request
 */
export const handleRagQuery = async (req: Request, res: Response) => {
  try {
    const { query, mode = RAGMode.GLOBAL } = req.body;
    const userId = (req as any).user?._id?.toString();

    if (mode === RAGMode.PERSONAL && !userId) {
      return res.status(401).json({ error: "Authentication required for PERSONAL mode" });
    }

    const result = await processRagQuery(query, mode, userId);
    res.json(result);
  } catch (error) {
    console.error("[RAG CONTROLLER] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
