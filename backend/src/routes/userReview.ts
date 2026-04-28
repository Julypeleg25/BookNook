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

/**
 * @swagger
 * /userReviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               externalBookId:
 *                 type: string
 *               rating:
 *                 type: number
 *               review:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *     parameters:
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.post("/", authenticate, upload.single("picture"), createReviewHandler);
router.get("/", getAllReviewsHandler);

/**
 * @swagger
 * /userReviews/user/{userId}:
 *   get:
 *     summary: Get reviews by user ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user reviews
 */
router.get("/user/:userId", getReviewsByUserIdHandler);

/**
 * @swagger
 * /userReviews/book/{bookId}:
 *   get:
 *     summary: Get reviews by book ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of book reviews
 */
router.get("/book/:bookId", getReviewsByBookIdHandler);

/**
 * @swagger
 * /userReviews/{id}:
 *   get:
 *     summary: Get review by ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *   patch:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *               picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.get("/:id", getReviewById);
router.patch("/:id", authenticate, isReviewAuthorMiddleware, upload.single("picture"), updateReviewHandler);
router.delete("/:id", authenticate, isReviewAuthorMiddleware, deleteReviewHandler);

/**
 * @swagger
 * /userReviews/{id}/like:
 *   post:
 *     summary: Like a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review liked
 */
router.post("/:id/like", authenticate, likeReviewHandler);

/**
 * @swagger
 * /userReviews/{id}/unlike:
 *   post:
 *     summary: Unlike a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review unliked
 */
router.post("/:id/unlike", authenticate, unlikeReviewHandler);

/**
 * @swagger
 * /userReviews/{id}/comments:
 *   post:
 *     summary: Add a comment to a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post("/:id/comments", authenticate, addCommentHandler);
router.delete("/:id/comments/:commentId", authenticate, deleteCommentHandler);

export default router;
