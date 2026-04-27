import { Request, Response, NextFunction } from "express";
import { AppError } from "@utils/errors";
import { logger } from "@utils/logger";
import { ENV } from "@config/config";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // AppError hierarchy (ValidationError, NotFoundError, UnauthorizedError, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.constructor.name,
    });
    return;
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
      code: "INVALID_JSON",
    });
    return;
  }

  // Multer file filter errors
  const errorMessage = err instanceof Error ? err.message : "Unknown error";
  if (errorMessage.includes("Only image files")) {
    res.status(400).json({
      success: false,
      message: errorMessage,
      code: "INVALID_FILE_TYPE",
    });
    return;
  }

  // Unknown errors — never expose stack traces in production
  logger.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: ENV.NODE_ENV === "production" ? "Internal Server Error" : errorMessage,
    code: "INTERNAL_ERROR",
  });
};
