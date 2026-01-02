import { UserReviewModel } from "../models/UserReview";
import {BookModel} from "../models/Book";
import { Types } from "mongoose";

export async function recomputeBookRating(bookId: string) {
      const bookObjectId = new Types.ObjectId(bookId);
  try {
    // Aggregate ratings from reviews for this bookId
    const result = await UserReviewModel.aggregate([
      { $match: { book: bookObjectId } },
      {
        $group: {
          _id: '$book',
          totalRating: { $sum: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const { totalRating = 0, count = 0 } = result[0] || {};

    const avgRating = count > 0 ? totalRating / count : 0;

    await BookModel.findOneAndUpdate(
      bookObjectId,
      {
        avgRating,
        ratingCount: count,
        ratingSum: totalRating,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error(`Error recomputing rating for book ${bookId}:`, error);
  }
}
