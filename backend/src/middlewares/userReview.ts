import { Request, Response, NextFunction } from "express";
import { isReviewAuthor } from "@services/userReviewService";
import { ForbiddenError } from "@utils/errors";
import { logger } from "@utils/logger";

export async function isReviewAuthorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Review ID is required" });
      return;
    }

    const userId = req.authenticatedUser?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const isAuthor = await isReviewAuthor(id, userId);

    if (!isAuthor) {
      throw new ForbiddenError("Not authorized to edit this review");
    }

    next();
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      res.status(403).json({ error: error.message });
      return;
    }
    logger.error("Error checking review author:", error);
    next(error);
  }
}
