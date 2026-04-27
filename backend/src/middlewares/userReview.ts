import { Request, Response, NextFunction } from "express";
import { isReviewAuthor } from "@services/userReviewService";
import { ForbiddenError, ValidationError, UnauthorizedError } from "@utils/errors";
import { logger } from "@utils/logger";

export const isReviewAuthorMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const userId = req.authenticatedUser?.id;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const isAuthor = await isReviewAuthor(id, userId);
    if (!isAuthor) {
      throw new ForbiddenError("Not authorized to edit this review");
    }

    next();
  } catch (error) {
    logger.error("Error checking review author:", error);
    next(error);
  }
};
