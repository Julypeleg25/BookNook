import express from "express";

import { authenticate } from "@middlewares/authMiddleware";
import { validateBody } from "@middlewares/validateRequest";
import { upload } from "@config/multerConfig";

import { getCurrentUser, updateUserHandler } from "@controllers/userController";
import { UpdateUserSchema } from "@shared/schemas/user.schema";

const router = express.Router();

router.get("/me", authenticate, getCurrentUser);

router.patch(
  "/me",
  authenticate,
  upload.single("avatar"),
  validateBody(UpdateUserSchema),
  updateUserHandler
);

export default router;
