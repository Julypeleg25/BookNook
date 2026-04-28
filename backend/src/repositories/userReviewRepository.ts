import { UserReviewModel, IUserReview, ReviewComment } from "@models/UserReview";
import { FilterQuery, Types } from "mongoose";
import { IUser } from "@models/User";
import { logger } from "@utils/logger";

interface PopulatedUserReview extends Omit<IUserReview, "user" | "comments"> {
  user: Pick<IUser, "username" | "avatar" | "bio">;
  comments: (Omit<ReviewComment, "user"> & { user: Pick<IUser, "username" | "avatar"> })[];
}

export type { PopulatedUserReview };

interface CreateReviewData {
  user: Types.ObjectId;
  book: Types.ObjectId;
  rating: number;
  review?: string;
  picturePath?: string;
}

interface AggregatedRating {
  totalRating: number;
  count: number;
}

export class UserReviewRepository {
  async create(reviewData: CreateReviewData): Promise<IUserReview> {
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

  async findByIdWithUser(
    reviewId: Types.ObjectId | string
  ): Promise<PopulatedUserReview | null> {
    try {
      return await UserReviewModel.findById(reviewId)
        .populate<{ user: IUser }>({
          path: "user",
          select: "username avatar bio",
        })
        .populate({
          path: "comments.user",
          select: "username avatar",
        }) as unknown as PopulatedUserReview | null;
    } catch (error) {
      logger.error(`Error finding review ${reviewId} with user:`, error);
      throw error;
    }
  }

  async findAll(
    minLikes?: number,
    searchQuery?: string,
    userId?: Types.ObjectId | Types.ObjectId[] | string,
    bookIds?: Types.ObjectId[],
    rating?: number,
    genre?: string,
    genreBookIds?: Types.ObjectId[]
  ): Promise<PopulatedUserReview[]> {
    try {
      const query: FilterQuery<IUserReview> = {};

      if (userId) {
        if (Array.isArray(userId)) {
          query.user = { $in: userId };
        } else {
          query.user = typeof userId === "string" && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
        }
      }

      if (minLikes && minLikes > 0) {
        query.$expr = { $gte: [{ $size: { $ifNull: ["$likes", []] } }, minLikes] };
      }

      if (rating && rating > 0) {
        query.rating = { $gte: rating };
      }

      if (genreBookIds) {
        query.book = { $in: genreBookIds };
      }

      if (searchQuery) {
        const searchConditions: FilterQuery<IUserReview>[] = [
          { review: { $regex: searchQuery, $options: "i" } }
        ];

        if (bookIds && bookIds.length > 0) {
          searchConditions.push({ book: { $in: bookIds } });
        }

        if (query.book) {
          query.$and = [
            { book: query.book },
            { $or: searchConditions }
          ];
          delete query.book;
        } else {
          query.$or = searchConditions;
        }
      }

      return await UserReviewModel.find(query)
        .sort({ createdAt: -1 })
        .populate<{ user: IUser }>({ path: "user", select: "username avatar" }) as unknown as PopulatedUserReview[];
    } catch (error) {
      logger.error("Error finding all reviews:", error);
      throw error;
    }
  }

  async findByUserId(userId: Types.ObjectId | string): Promise<PopulatedUserReview[]> {
    try {
      return await UserReviewModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate<{ user: IUser }>({ path: "user", select: "username avatar" }) as unknown as PopulatedUserReview[];
    } catch (error) {
      logger.error(`Error finding reviews by userId ${userId}:`, error);
      throw error;
    }
  }

  async findByBookId(bookId: Types.ObjectId | string): Promise<PopulatedUserReview[]> {
    try {
      const bookObjectId = typeof bookId === "string" && Types.ObjectId.isValid(bookId) ? new Types.ObjectId(bookId) : bookId;
      return await UserReviewModel.find({ book: bookObjectId })
        .sort({ createdAt: -1 })
        .populate<{ user: IUser }>({ path: "user", select: "username avatar bio" })
        .lean() as unknown as PopulatedUserReview[];
    } catch (error) {
      logger.error(`Error finding reviews by bookId ${bookId}:`, error);
      throw error;
    }
  }

  async update(
    reviewId: Types.ObjectId | string,
    updateData: Partial<Pick<IUserReview, "review" | "rating" | "picturePath">>
  ): Promise<IUserReview | null> {
    try {
      return await UserReviewModel.findByIdAndUpdate(
        reviewId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
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

  async addLike(
    reviewId: Types.ObjectId | string,
    userId: Types.ObjectId
  ): Promise<IUserReview | null> {
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

  async removeLike(
    reviewId: Types.ObjectId | string,
    userId: Types.ObjectId
  ): Promise<IUserReview | null> {
    try {
      return await UserReviewModel.findByIdAndUpdate(
        reviewId,
        { $pull: { likes: userId } },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error removing like from review ${reviewId}:`, error);
      throw error;
    }
  }

  async aggregateRatingsByBook(
    bookId: Types.ObjectId | string
  ): Promise<AggregatedRating> {
    try {
      const bookObjectId =
        typeof bookId === "string" ? new Types.ObjectId(bookId) : bookId;
      const result = await UserReviewModel.aggregate<{
        _id: Types.ObjectId;
        totalRating: number;
        count: number;
      }>([
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
        totalRating: result[0]?.totalRating ?? 0,
        count: result[0]?.count ?? 0,
      };
    } catch (error) {
      logger.error(`Error aggregating ratings for book ${bookId}:`, error);
      throw error;
    }
  }
}

export const userReviewRepository = new UserReviewRepository();
