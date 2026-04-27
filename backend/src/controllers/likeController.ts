import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { likeReview, unlikeReview } from "@services/likeService";
import { ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";

export const likeReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const likesCount = await likeReview(
      id as string,
      new Types.ObjectId(req.authenticatedUser!.id)
    );
    res.json({ likes: likesCount });
  } catch (error) {
    logger.error(`Error liking review ${req.params.id}:`, error);
    next(error);
  }
};

export const unlikeReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const likesCount = await unlikeReview(
      id as string,
      new Types.ObjectId(req.authenticatedUser!.id)
    );
    res.json({ likes: likesCount });
  } catch (error) {
    logger.error(`Error unliking review ${req.params.id}:`, error);
    next(error);
  }
};
