import { Router, Request, Response } from 'express';
import multer from 'multer';
import { UserReviewModel } from '../models/UserReview';
import { isReviewAuthor } from '../middlewares/userReview';

const router = Router();

// Multer for picture upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

/**
 * Create a new review with optional picture
 * POST /reviews
 * Body: { bookId, review, rating }
 * File: picture
 */
router.post('/', upload.single('picture'), async (req: Request, res: Response) => {
  try {
    const { bookId, review, rating } = req.body;
    const picturePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newReview = await UserReviewModel.create({
      userId: req.user.id,
      bookId,
      review,
      rating,
      picturePath,
      comments: [],
      likes: [],
    });

    res.status(201).json(newReview);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

/**
 * Update a review
 * PATCH /reviews/:id
 * Only the author can update
 */
router.patch('/:id', isReviewAuthor, upload.single('picture'), async (req: Request, res: Response) => {
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

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Like a review
 * POST /reviews/:id/like
 * Cannot like your own review
 */
router.post('/:id/like', async (req: Request, res: Response) => {
  try {
    const review = await UserReviewModel.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() === req.user.id) {
      return res.status(400).json({ message: "You can't like your own review" });
    }

    // Add user to likes if not already liked
    if (!review.likes.includes(req.user.id)) {
      review.likes.push(req.user.id);
      await review.save();
    }

    res.json({ likes: review.likes.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
