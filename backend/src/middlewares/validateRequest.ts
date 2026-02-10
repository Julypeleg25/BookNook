import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export const validateBody =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of zodError.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      res.status(400).json({
        error: "Validation failed",
        fields: fieldErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
