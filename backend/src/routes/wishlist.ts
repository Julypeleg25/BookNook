import express from "express";
import {
  addBookToWishlist,
  getWishlist,
  removeBookFromWishlist,
} from "@controllers/wishlistController";
import { authenticate } from "@middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/wishlist/{bookId}:
 *   post:
 *     summary: Add a book to the wishlist
 *     tags: [Wishlist]
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
 *         description: Updated wishlist
 */
router.post("/:bookId", authenticate, addBookToWishlist);
router.delete("/:bookId", authenticate, removeBookFromWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist
 */
router.get("/", authenticate, getWishlist);

export default router;
