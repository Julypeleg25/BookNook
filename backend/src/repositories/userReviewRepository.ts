import { UserReviewModel, IUserReview } from "../models/UserReview";
import { Types } from "mongoose";
import { IUser } from "../models/User";
import { logger } from "../utils/logger";

export class UserReviewRepository {
  async create(reviewData: {
    user: Types.ObjectId;
    book: Types.ObjectId;
    rating: number;
    review?: string;
    picturePath?: string;
  }): Promise<IUserReview> {
    try {
      return await UserReviewModel.create({
        ...reviewData,
        comments: [],
        likes: [],
      });
    } catch (error) {
      logger.error("Error creating review:", error);
      throw error;
    }
  }

  async findById(reviewId: Types.ObjectId | string): Promise<IUserReview | null> {
    try {
      return await UserReviewModel.findById(reviewId);
    } catch (error) {
      logger.error(`Error finding review by ID ${reviewId}:`, error);
      throw error;
    }
  }

  async findByIdWithUser(reviewId: Types.ObjectId | string): Promise<any> {
    try {
      return await UserReviewModel.findById(reviewId).populate<{ user: IUser }>({
        path: "user",
        select: "name username avatar bio",
      });
    } catch (error) {
      logger.error(`Error finding review ${reviewId} with user:`, error);
      throw error;
    }
  }

  async findAll(): Promise<any[]> {
    try {
      return await UserReviewModel.find()
        .sort({ createdAt: -1 })
        .populate<{ user: IUser }>({ path: "user", select: "name username avatar" });
    } catch (error) {
      logger.error("Error finding all reviews:", error);
      throw error;
    }
  }

  async findByUserId(userId: Types.ObjectId | string): Promise<any[]> {
    try {
      return await UserReviewModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate<{ user: IUser }>({ path: "user", select: "name username avatar" });
    } catch (error) {
      logger.error(`Error finding reviews by userId ${userId}:`, error);
      throw error;
    }
  }

  async update(
    reviewId: Types.ObjectId | string,
    updateData: Partial<IUserReview>
  ): Promise<IUserReview | null> {
    try {
      return await UserReviewModel.findByIdAndUpdate(reviewId, { $set: updateData }, { new: true });
    } catch (error) {
      logger.error(`Error updating review ${reviewId}:`, error);
      throw error;
    }
  }

  async delete(reviewId: Types.ObjectId | string): Promise<IUserReview | null> {
    try {
      return await UserReviewModel.findByIdAndDelete(reviewId);
    } catch (error) {
      logger.error(`Error deleting review ${reviewId}:`, error);
      throw error;
    }
  }

  async addLike(reviewId: Types.ObjectId | string, userId: Types.ObjectId): Promise<IUserReview | null> {
    try {
      return await UserReviewModel.findByIdAndUpdate(
        reviewId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error adding like to review ${reviewId}:`, error);
      throw error;
    }
  }

  async aggregateRatingsByBook(bookId: Types.ObjectId | string): Promise<{
    totalRating: number;
    count: number;
  }> {
    try {
      const bookObjectId = typeof bookId === "string" ? new Types.ObjectId(bookId) : bookId;
      const result = await UserReviewModel.aggregate([
        { $match: { book: bookObjectId } },
        {
          $group: {
            _id: "$book",
            totalRating: { $sum: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        totalRating: result[0]?.totalRating || 0,
        count: result[0]?.count || 0,
      };
    } catch (error) {
      logger.error(`Error aggregating ratings for book ${bookId}:`, error);
      throw error;
    }
  }
}

export const userReviewRepository = new UserReviewRepository();

