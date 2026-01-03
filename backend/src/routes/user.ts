import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { getCurrentUser, updateUserHandler } from "../controllers/userController";
import { upload } from "../config/multerConfig";

const router = express.Router();

router.get("/me", requireAuth, getCurrentUser);
router.patch("/me", requireAuth, upload.single("avatar"), updateUserHandler);

export default router;

