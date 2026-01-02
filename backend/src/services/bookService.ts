import { UserReviewModel } from "../models/UserReview";
import Book from "../models/Book";

export async function recomputeBookRating(bookId: string) {
  try {
    // Aggregate ratings from reviews for this bookId
    const result = await UserReviewModel.aggregate([
      { $match: { bookId } },
      {
        $group: {
          _id: null,
          totalRating: { $sum: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const { totalRating = 0, count = 0 } = result[0] || {};

    const avgRating = count > 0 ? totalRating / count : 0;

    // Upsert the Book document
    await Book.findOneAndUpdate(
      { bookId },
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
