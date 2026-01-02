import { Router, Request, Response } from "express";
import axios from "axios";
import multer from "multer";
import { IUserReview, UserReviewModel } from "../models/UserReview";
import { isReviewAuthor } from "../middlewares/userReview";
import { recomputeBookRating } from "../services/bookService";
import { BookModel, IBook } from "../models/Book";
import { IUser } from "../models/User";
import { getBookByGoogleIdFromGoogle, getGoogleBookByLocalId, getLocalBookByGoogleId } from "./books";
import { Types } from "mongoose";

const router = Router();

// Multer for picture upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/**
 * Adds a review for a book using external API ID
 */
export const addReview = async (
  userId: Types.ObjectId,
  externalBookId: string, // external API ID
  rating: number,
  reviewText?: string,
  picturePath?: string
) => {
  let book = await getLocalBookByGoogleId(externalBookId)
  if (!book) {
      book = await BookModel.create({ externalId: externalBookId });
  }

  const newReview = await UserReviewModel.create({
    user: userId,
    book: book._id, 
    rating,
    review: reviewText,
    picturePath,
    comments: [],
    likes: [],
  });

  await recomputeBookRating(book._id.toString());

  return newReview;
};
/**
 * Create a new review with optional picture
 * POST /reviews
 * Body: { bookId, review, rating }
 * File: picture
 */
router.post("/", upload.single("picture"), async (req: Request, res: Response) => {
  try {
    const { bookId, review, rating } = req.body; // bookId = external API ID
    const picturePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newReview = await addReview(
      req.authenticatedUser!._id,
      bookId,
      Number(rating),
      review,
      picturePath
    );

    res.status(201).json(newReview);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

/**
 * Get all reviews
 * GET /reviews
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const reviews = await UserReviewModel.find()
      .sort({ createdAt: -1 })
      .populate<{ user: IUser }>({ path: "user", select: "name username avatar" })

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const reviewObj = r.toObject();
        try {

          const fullBookOfReview = await getGoogleBookByLocalId(reviewObj.book.toString());
          return {
            ...reviewObj,
            book: fullBookOfReview,
          };
        } catch (e) {
          // ignore book fetch errors
        }
      })
    );

    res.json(enriched);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

/**
 * Get reviews by user id
 * GET /reviews/user/:userId
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const reviews = await UserReviewModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate<{ user: IUser }>({ path: "user", select: "name username avatar" })
      .populate<{ book: IBook }>({ path: "book", select: "title authors thumbnail" });
    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const reviewObj = r.toObject();
        try {
          const resp = await axios.get(
            `http://localhost:${process.env.PORT || 3000}/api/books/${
              reviewObj.book._id.toString()
            }`
          );
          reviewObj.book = resp.data.book;
        } catch (e) {
          // ignore
        }
        return reviewObj;
      })
    );

    res.json(enriched);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user reviews" });
  }
});

/**
 * Get review by review id with populated author and book info
 * GET /reviews/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await UserReviewModel.findById(id).populate<{ user: IUser }>({
      path: "user",
      select: "name username avatar bio",
    });

    if (!review) return res.status(404).json({ message: "Review not found" });

    // If you want to include book details from the books API, you can fetch it here using bookId.
    res.json(review);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch review" });
  }
});

/**
 * Update a review
 * PATCH /reviews/:id
 * Only the author can update
 */
router.patch(
  "/:id",
  isReviewAuthor,
  upload.single("picture"),
  async (req: Request, res: Response) => {
    try {
      const { review, rating } = req.body;
      const updateData: Partial<IUserReview> = {};
      if (review) updateData.review = review;
      if (rating) updateData.rating = rating;
      if (req.file) updateData.picturePath = `/uploads/${req.file.filename}`;

      const updatedUserReview = await UserReviewModel.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      if (updatedUserReview) {
        await recomputeBookRating(updatedUserReview.book.toString());
      }

      res.json(updatedUserReview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Like a review
 * POST /reviews/:id/like
 * Cannot like your own review
 */
router.post("/:id/like", async (req: Request, res: Response) => {
  try {
    const review = await UserReviewModel.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() === req.authenticatedUser?._id.toString()) {
      return res
        .status(400)
        .json({ message: "You can't like your own review" });
    }

    // Add user to likes if not already liked
    if (!review.likes.includes(req.authenticatedUser!._id)) {
      review.likes.push(req.authenticatedUser!._id);
      await review.save();
    }

    res.json({ likes: review.likes.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Delete a review
 * DELETE /reviews/:id
 * Only the author can delete
 */
router.delete("/:id", isReviewAuthor, async (req: Request, res: Response) => {
  try {
    const review = await UserReviewModel.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await recomputeBookRating(review.book.toString());

    res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
