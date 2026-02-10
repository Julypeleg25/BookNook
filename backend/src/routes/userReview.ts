
import { Router } from "express";
import {
  createReviewHandler,
  getAllReviewsHandler,
  getReviewsByUserIdHandler,
  getReviewByIdHandler as getReviewById,
  updateReviewHandler,
  deleteReviewHandler,
} from "@controllers/userReviewController";
import { likeReviewHandler, unlikeReviewHandler } from "@controllers/likeController";
import { addCommentHandler, deleteCommentHandler } from "@controllers/commentController";
import { isReviewAuthorMiddleware } from "@middlewares/userReview";
import { upload } from "@config/multerConfig";

const router = Router();

router.post("/", upload.single("picture"), createReviewHandler);
router.get("/", getAllReviewsHandler);
router.get("/user/:userId", getReviewsByUserIdHandler);
router.get("/:id", getReviewById);
router.patch("/:id", isReviewAuthorMiddleware, upload.single("picture"), updateReviewHandler);
router.post("/:id/like", likeReviewHandler);
router.post("/:id/unlike", unlikeReviewHandler);
router.delete("/:id", isReviewAuthorMiddleware, deleteReviewHandler);

router.post("/:id/comments", addCommentHandler);
router.delete("/:id/comments/:commentId", deleteCommentHandler);

export default router;
