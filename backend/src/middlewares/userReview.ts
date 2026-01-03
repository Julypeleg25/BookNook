import { Request, Response, NextFunction } from "express";
import { isReviewAuthor } from "../services/userReviewService";
import { ForbiddenError } from "../utils/errors";
import { logger } from "../utils/logger";

export async function isReviewAuthorMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const isAuthor = await isReviewAuthor(id, req.authenticatedUser!._id);
    
    if (!isAuthor) {
      throw new ForbiddenError("Not authorized to edit this review");
    }
    
    next();
  } catch (error: any) {
    logger.error("Error checking review author:", error);
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
}
