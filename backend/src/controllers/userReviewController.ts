import { Request, Response, NextFunction } from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByUserId,
  getReviewById,
  updateReview,
  deleteReview,
} from "@services/userReviewService";
import { getGoogleBookByLocalId } from "@services/bookService";
import { ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";
import { isImageFile, deleteFile } from "@utils/fileUtils";
import { Types } from "mongoose";
import { HttpStatusCode } from "axios";

export const createReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookId, review, rating } = req.body;

    if (req.file && !isImageFile(req.file.originalname)) {
      await deleteFile(req.file.path);
      throw new ValidationError("Picture must be an image file");
    }

    if (!bookId || typeof bookId !== "string") {
      if (req.file) await deleteFile(req.file.path);
      throw new ValidationError("Book ID is required");
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      if (req.file) await deleteFile(req.file.path);
      throw new ValidationError("Rating must be a number between 0 and 5");
    }

    const picturePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newReview = await createReview(
      new Types.ObjectId(req.authenticatedUser!.id),
      bookId,
      parsedRating,
      review,
      picturePath
    );

    res.status(HttpStatusCode.Created).json(newReview);
  } catch (error: unknown) {
    if (req.file) await deleteFile(req.file.path);
    logger.error("Error creating review:", error);
    next(error);
  }
};

export const getAllReviewsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await getAllReviews();

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const reviewObj = r.toObject();
        try {
          const fullBookOfReview = await getGoogleBookByLocalId(
            reviewObj.book.toString()
          );
          return {
            ...reviewObj,
            book: fullBookOfReview,
          };
        } catch (error) {
          logger.warn(
            `Error enriching review ${reviewObj._id} with book data:`,
            error
          );
          return reviewObj;
        }
      })
    );

    res.json(enriched);
  } catch (error) {
    logger.error("Error fetching all reviews:", error);
    next(error);
  }
};

export const getReviewsByUserIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const reviews = await getReviewsByUserId(userId);
    res.json(reviews);
  } catch (error) {
    logger.error(
      `Error fetching reviews for user ${req.params.userId}:`,
      error
    );
    next(error);
  }
};

export const getReviewByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const review = await getReviewById(id);
    res.json(review);
  } catch (error) {
    logger.error(`Error fetching review ${req.params.id}:`, error);
    next(error);
  }
};

export const updateReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    const { review, rating } = req.body;

    const updateData: {
      review?: string;
      rating?: number;
      picturePath?: string;
    } = {};

    if (review !== undefined) updateData.review = review;
    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        if (req.file) await deleteFile(req.file.path);
        throw new ValidationError("Rating must be a number between 0 and 5");
      }
      updateData.rating = parsedRating;
    }

    if (req.file) {
      if (!isImageFile(req.file.originalname)) {
        await deleteFile(req.file.path);
        throw new ValidationError("Picture must be an image file");
      }
      updateData.picturePath = `/uploads/${req.file.filename}`;
    }

    const updatedReview = await updateReview(id, updateData);
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
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError("Review ID is required");
    }

    await deleteReview(id);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting review ${req.params.id}:`, error);
    next(error);
  }
};
