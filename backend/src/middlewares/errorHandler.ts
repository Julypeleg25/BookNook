import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/errors";
import { logger } from "@utils/logger";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.isOperational ? {} : { type: "internal" }),
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Invalid JSON in request body" });
    return;
  }

  const errorMessage = err instanceof Error ? err.message : "Unknown error";

  if (errorMessage.includes("Only image files")) {
    res.status(400).json({ error: errorMessage });
    return;
  }

  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};
