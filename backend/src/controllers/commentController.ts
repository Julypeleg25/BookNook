import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { addComment, deleteComment } from "@services/commentService";
import { ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";

export const addCommentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!id) throw new ValidationError("Review ID is required");
    if (!comment) throw new ValidationError("Comment is required");

    const comments = await addComment(
      id,
      new Types.ObjectId(req.authenticatedUser!.id),
      comment
    );
    res.json(comments);
  } catch (error) {
    logger.error(`Error adding comment to review ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteCommentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, commentId } = req.params;

    if (!id) throw new ValidationError("Review ID is required");
    if (!commentId) throw new ValidationError("Comment ID is required");

    const comments = await deleteComment(
      id,
      commentId,
      req.authenticatedUser!.id
    );
    res.json(comments);
  } catch (error) {
    logger.error(`Error deleting comment ${req.params.commentId}:`, error);
    next(error);
  }
};
