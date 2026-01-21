import { Request, Response, NextFunction } from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByUserId,
  getReviewById,
  updateReview,
  deleteReview,
  likeReview,
} from "@services/userReviewService";
import { getGoogleBookByLocalId } from "@services/bookService";
import { ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";
import { isImageFile, deleteFile } from "@utils/fileUtils";
import { Types } from "mongoose";

export const createReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookId, review, rating } = req.body;
    if (req.file && !isImageFile(req.file.originalname)) {
      deleteFile(req.file.path);
      throw new ValidationError("Picture must be an image file");
    }

    const picturePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newReview = await createReview(
      new Types.ObjectId(req.authenticatedUser!.id),
      bookId,
      Number(rating),
      review,
      picturePath
    );

    res.status(201).json(newReview);
  } catch (error: any) {
    if (req.file) deleteFile(req.file.path);
    if (error?.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    logger.error("Error creating review:", error);
    next(error);
  }
};

export const getAllReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
        } catch (e) {
          logger.warn(
            `Error enriching review ${reviewObj._id} with book data:`,
            e
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
) => {
  try {
    const { userId } = req.params;
    if (!userId) throw Error(`user id ${userId} doesn't exist`);
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
) => {
  try {
    const { id } = req.params;
    if (!id) throw Error(`review ${id} doesn't exist`);
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
) => {
  try {
    const { id } = req.params;
    const { review, rating } = req.body;

    const updateData: {
      review?: string;
      rating?: number;
      picturePath?: string;
    } = {};

    if (review !== undefined) updateData.review = review;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (req.file) {
      if (!isImageFile(req.file.originalname)) {
        deleteFile(req.file.path);
        throw new ValidationError("Picture must be an image file");
      }
      updateData.picturePath = `/uploads/${req.file.filename}`;
    }

    if (!id) throw Error(`review ${id} doesn't exist`);
    const updatedReview = await updateReview(id, updateData);
    res.json(updatedReview);
  } catch (error: any) {
    if (req.file) deleteFile(req.file.path);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    logger.error(`Error updating review ${req.params.id}:`, error);
    next(error);
  }
};

export const likeReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) throw Error(`review ${id} doesn't exist`);
    const likesCount = await likeReview(id, new Types.ObjectId(req.authenticatedUser!.id));
    res.json({ likes: likesCount });
  } catch (error) {
    logger.error(`Error liking review ${req.params.id}:`, error);
    next(error);
  }
};

export const deleteReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) throw Error(`review ${id} doesn't exist`);
    await deleteReview(id);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting review ${req.params.id}:`, error);
    next(error);
  }
};
