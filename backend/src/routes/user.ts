import express from "express";

import { requireAuth } from "@middlewares/authMiddleware";
import { validateBody } from "@middlewares/validateRequest";
import { upload } from "@config/multerConfig";

import { getCurrentUser, updateUserHandler } from "@controllers/userController";

import { UpdateUserSchema } from "@shared/types/user";

const router = express.Router();

router.get("/me", requireAuth, getCurrentUser);

router.patch(
  "/me",
  requireAuth,
  upload.single("avatar"),
  validateBody(UpdateUserSchema),
  updateUserHandler
);

export default router;
