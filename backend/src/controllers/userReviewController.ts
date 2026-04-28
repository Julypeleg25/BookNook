import { Request, Response, NextFunction } from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByUserId,
  getReviewsByBookId,
} from "@services/userReviewService";
import { ForbiddenError, ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";
import { isImageFile, deleteFile } from "@utils/fileUtils";
import { Types } from "mongoose";
import { HttpStatusCode } from "axios";
import {
  deleteReview,
  getPopulatedReviewById,
  isReviewAuthor,
  updateReview,
  getEnrichedReviews,
} from "@services/userReviewService";
import {
  parseGetAllReviewsQuery,
  parseRating,
  validateOptionalReviewText,
  validateReviewText,
  type ReviewUpdateInput,
} from "../validators/userReview.validators";

export const createReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { bookId, rating } = req.body;
    const normalizedReview = validateReviewText(req.body.review);

    if (req.file && !isImageFile(req.file.originalname)) {
      await deleteFile(req.file.path);
      throw new ValidationError("Picture must be an image file");
    }

    if (!bookId || typeof bookId !== "string") {
      if (req.file) await deleteFile(req.file.path);
      throw new ValidationError("Book ID is required");
    }

    if (!req.file) {
      throw new ValidationError("Post image is required");
    }

    const parsedRating = parseRating(rating);

    const picturePath = `/uploads/${req.file.filename}`;

    const newReview = await createReview(
      new Types.ObjectId(req.authenticatedUser!.id),
      bookId,
      parsedRating,
      normalizedReview,
      picturePath,
    );

    res.status(HttpStatusCode.Created).json(newReview);
  } catch (error: unknown) {
    if (req.file) await deleteFile(req.file.path);
    logger.error("Error creating review:", error);
    next(error);
  }
};

export const getAllReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { minLikes, searchQuery, username, rating, genre } =
      parseGetAllReviewsQuery(req.query);
    const reviews = await getAllReviews(minLikes, searchQuery, username, rating, genre);
    const enriched = await getEnrichedReviews(reviews);

    res.json(enriched);
  } catch (error: unknown) {
    logger.error("Error fetching all reviews:", error);
    next(error);
  }
};

export const getReviewsByUserIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const reviews = await getReviewsByUserId(userId as string);
    const enriched = await getEnrichedReviews(reviews);
    res.json(enriched);
  } catch (error: unknown) {
    logger.error(
      `Error fetching reviews for user ${req.params.userId}:`,
      error,
    );
    next(error);
  }
};

export const getReviewsByBookIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { bookId } = req.params;
    if (!bookId) {
      throw new ValidationError("Book ID is required");
    }

    const reviews = await getReviewsByBookId(bookId as string);
    const enriched = await getEnrichedReviews(reviews);
    res.json(enriched);
  } catch (error: unknown) {
    logger.error(
      `Error fetching reviews for book ${req.params.bookId}:`,
      error,
    );
    next(error);
  }
};

export const getReviewByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const review = await getPopulatedReviewById(id as string);
    res.json(review);
  } catch (error: unknown) {
    logger.error(`Error fetching review ${req.params.id}:`, error);
    next(error);
  }
};

export const updateReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const { rating } = req.body;

    const updateData: ReviewUpdateInput = {};
    const normalizedReview = validateOptionalReviewText(req.body.review);

    if (normalizedReview !== undefined) {
      updateData.review = normalizedReview;
    }
    if (rating !== undefined) {
      const parsedRating = parseRating(rating);
      updateData.rating = parsedRating;
    }

    if (req.file) {
      if (!isImageFile(req.file.originalname)) {
        await deleteFile(req.file.path);
        throw new ValidationError("Picture must be an image file");
      }
      updateData.picturePath = `/uploads/${req.file.filename}`;
    }

    const updatedReview = await updateReview(id as string, updateData);
    res.json(updatedReview);
  } catch (error: unknown) {
    if (req.file) await deleteFile(req.file.path);
    logger.error(`Error updating review ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const userId = req.authenticatedUser!.id;
    const isOwner = await isReviewAuthor(id as string, userId as string);

    if (!isOwner) {
      throw new ForbiddenError("You are not authorized to delete this review");
    }

    await deleteReview(id as string);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting review ${req.params.id}:`, error);
    next(error);
  }
};
