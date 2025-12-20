import { Request, Response, NextFunction } from 'express';
import { UserReviewModel } from '../models/UserReview';

export async function isReviewAuthor(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const review = await UserReviewModel.findById(id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (review.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to edit this review' });
  }
  next();
}
