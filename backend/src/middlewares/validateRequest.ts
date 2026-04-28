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

const getFirstZodErrorMessage = (zodError: ZodError): string =>
  zodError.issues[0]?.message ?? "Validation failed";

export const validateBody =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: getFirstZodErrorMessage(result.error),
        code: "VALIDATION_ERROR",
        details,
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
      const details = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: getFirstZodErrorMessage(result.error),
        code: "VALIDATION_ERROR",
        details,
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
      const details = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: getFirstZodErrorMessage(result.error),
        code: "VALIDATION_ERROR",
        details,
      });
      return;
    }

    next();
  };
