import { Router, Request, Response } from "express";
import axios from "axios";
import multer from "multer";
import { PopulatedUserReview, UserReviewModel } from "../models/UserReview";
import { isReviewAuthor } from "../middlewares/userReview";
import { recomputeBookRating } from "../services/bookService";

const router = Router();

// Multer for picture upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/**
 * Create a new review with optional picture
 * POST /reviews
 * Body: { bookId, review, rating }
 * File: picture
 */
router.post(
  "/",
  upload.single("picture"),
  async (req: Request, res: Response) => {
    try {
      const { bookId, review, rating } = req.body;
      const picturePath = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const newReview = await UserReviewModel.create({
        userId: req.authenticatedUser!._id,
        bookId,
        review,
        rating,
        picturePath,
        comments: [],
        likes: [],
      });

      // Recompute book rating after creating review
      await recomputeBookRating(bookId);

      res.status(201).json(newReview);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Failed to create review" });
    }
  }
);

/**
 * Get all reviews
 * GET /reviews
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const reviews = await UserReviewModel.find()
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "name username avatar" })
      .populate({ path: "bookId", select: "title authors thumbnail" });

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const reviewObj = r.toObject();
        try {
          const resp = await axios.get(
            `http://localhost:${process.env.PORT || 3000}/api/books/${
              reviewObj.bookId
            }`
          );
          reviewObj.book = resp.data.book;
        } catch (e) {
          // ignore book fetch errors
        }
        return reviewObj;
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
    const reviews = await UserReviewModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "name username avatar" });

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const reviewObj = r.toObject();
        try {
          const resp = await axios.get(
            `http://localhost:${process.env.PORT || 3000}/api/books/${
              reviewObj.bookId
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
    const review = await UserReviewModel.findById(id).populate({
      path: "userId",
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
      const updateData: any = {};
      if (review) updateData.review = review;
      if (rating) updateData.rating = rating;
      if (req.file) updateData.picturePath = `/uploads/${req.file.filename}`;

      const updated = await UserReviewModel.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );

      // Recompute book rating after updating review
      if (updated) {
        await recomputeBookRating(updated.bookId);
      }

      res.json(updated);
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

    if (review.userId.toString() === req.authenticatedUser?._id.toString()) {
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

    // Recompute book rating after deleting review
    await recomputeBookRating(review.bookId);

    res.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
