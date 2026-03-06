import express from "express";
import {
  addBookToList,
  getWishlist,
  getReadlist,
  removeBookFromList,
} from "@controllers/listController";

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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [wish, read]
 *     responses:
 *       200:
 *         description: Book added to list
 *   delete:
 *     summary: Remove a book from a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [wish, read]
 *     responses:
 *       200:
 *         description: Book removed from list
 */
router.post("/:bookId", addBookToList);
router.delete("/:bookId", removeBookFromList);

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
router.get("/wishlist", getWishlist);

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
router.get("/readlist", getReadlist);

export default router;
