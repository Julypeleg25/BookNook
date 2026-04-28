import express from "express";

import { authenticate } from "@middlewares/authMiddleware";
import { validateBody } from "@middlewares/validateRequest";
import { upload } from "@config/multerConfig";

import { getCurrentUser, updateUserHandler } from "@controllers/userController";
import { UpdateUserSchema } from "@shared/schemas/user.schema";

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated
 */
router.get("/me", authenticate, getCurrentUser);
router.patch(
  "/me",
  authenticate,
  upload.single("avatar"),
  validateBody(UpdateUserSchema),
  updateUserHandler
);

export default router;
