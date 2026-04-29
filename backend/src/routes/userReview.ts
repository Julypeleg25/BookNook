import { Router } from "express";
import {
  createReviewHandler,
  getAllReviewsHandler,
  getReviewsByUserIdHandler,
  getReviewsByBookIdHandler,
  getReviewByIdHandler as getReviewById,
  updateReviewHandler,
  deleteReviewHandler,
} from "@controllers/userReviewController";
import { likeReviewHandler, unlikeReviewHandler } from "@controllers/likeController";
import { addCommentHandler, deleteCommentHandler } from "@controllers/commentController";
import { isReviewAuthorMiddleware } from "@middlewares/userReview";
import { upload } from "@config/multerConfig";
import { authenticate } from "@middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, upload.single("picture"), createReviewHandler);
router.get("/", getAllReviewsHandler);

router.get("/user/:userId", getReviewsByUserIdHandler);

router.get("/book/:bookId", getReviewsByBookIdHandler);

router.get("/:id", getReviewById);
router.patch("/:id", authenticate, isReviewAuthorMiddleware, upload.single("picture"), updateReviewHandler);
router.delete("/:id", authenticate, isReviewAuthorMiddleware, deleteReviewHandler);

router.post("/:id/like", authenticate, likeReviewHandler);

router.post("/:id/unlike", authenticate, unlikeReviewHandler);

router.post("/:id/comments", authenticate, addCommentHandler);
router.delete("/:id/comments/:commentId", authenticate, deleteCommentHandler);

export default router;
