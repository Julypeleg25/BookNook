import { Router } from "express";
import {
  createReviewHandler,
  getAllReviewsHandler,
  getReviewsByUserIdHandler,
  getReviewByIdHandler as getReviewById,
  updateReviewHandler,
  likeReviewHandler,
  deleteReviewHandler,
} from "@controllers/userReviewController";
import { isReviewAuthorMiddleware } from "@middlewares/userReview";
import { upload } from "@config/multerConfig";

const router = Router();

router.post("/", upload.single("picture"), createReviewHandler);
router.get("/", getAllReviewsHandler);
router.get("/user/:userId", getReviewsByUserIdHandler);
router.get("/:id", getReviewById);
router.patch("/:id", isReviewAuthorMiddleware, upload.single("picture"), updateReviewHandler);
router.post("/:id/like", likeReviewHandler);
router.delete("/:id", isReviewAuthorMiddleware, deleteReviewHandler);

export default router;
