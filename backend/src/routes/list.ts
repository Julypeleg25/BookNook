import express from "express";
import {
  addBookToList,
  getWishlist,
  getReadlist,
  removeBookFromList,
} from "@controllers/listController";
import { authenticate } from "@middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/lists/{bookId}:
 *   post:
 *     summary: Add a book to a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
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
 *               listType:
 *                 type: string
 *                 enum: [wish, read]
 *     responses:
 *       200:
 *         description: Book removed from list
 */
router.post("/:bookId", authenticate, addBookToList);
router.delete("/:bookId", authenticate, removeBookFromList);

/**
 * @swagger
 * /api/lists/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist
 */
router.get("/wishlist", authenticate, getWishlist);

/**
 * @swagger
 * /api/lists/readlist:
 *   get:
 *     summary: Get user's readlist
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's readlist
 */
router.get("/readlist", authenticate, getReadlist);

export default router;
