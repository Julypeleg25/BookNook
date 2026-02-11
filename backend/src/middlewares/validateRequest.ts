import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

const formatZodErrors = (zodError: ZodError): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of zodError.issues) {
    const path = issue.path.join(".") || "_root";
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
};

export const validateBody =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: formatZodErrors(result.error),
      });
      return;
    }

    req.body = result.data;
    next();
  };

export const validateParams =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request parameters",
        code: "VALIDATION_ERROR",
        details: formatZodErrors(result.error),
      });
      return;
    }

    next();
  };

export const validateQuery =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        code: "VALIDATION_ERROR",
        details: formatZodErrors(result.error),
      });
      return;
    }

    next();
  };
