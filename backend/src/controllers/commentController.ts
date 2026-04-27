import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { addComment, deleteComment } from "@services/commentService";
import { ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";
import {
  COMMENT_TEXT_MAX_LENGTH,
  COMMENT_TEXT_MIN_LENGTH,
} from "@shared/constants/validation";
import { validateTextInput } from "@utils/textValidation";

export const addCommentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const normalizedComment = validateTextInput(req.body.comment, {
      fieldLabel: "Comment",
      minLength: COMMENT_TEXT_MIN_LENGTH,
      maxLength: COMMENT_TEXT_MAX_LENGTH,
    });

    if (!id) throw new ValidationError("Review ID is required");

    const comments = await addComment(
      id as string,
      new Types.ObjectId(req.authenticatedUser!.id),
      normalizedComment
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
      id as string,
      commentId as string,
      req.authenticatedUser!.id
    );
    res.json(comments);
  } catch (error) {
    logger.error(`Error deleting comment ${req.params.commentId}:`, error);
    next(error);
  }
};
