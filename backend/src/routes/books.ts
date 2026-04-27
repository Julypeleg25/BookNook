import { Router } from "express";
import { searchBooksHandler, getBookByIdHandler } from "@controllers/bookController";
import { authenticate } from "@middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Search for books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of books
 */
router.get("/", authenticate, searchBooksHandler);

/**
 * @swagger
 * /api/books/{externalBookId}:
 *   get:
 *     summary: Get book details by external ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: externalBookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details
 */
router.get("/:externalBookId", authenticate, getBookByIdHandler);

export default router;
