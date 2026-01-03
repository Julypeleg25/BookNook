import express from "express";
import passport from "passport";
import {
  googleAuthCallback,
  logout,
  register,
  login,
  refresh,
} from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";
import { getCurrentUser } from "../controllers/userController";
import { upload } from "../config/multerConfig";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get("/", (_req, res) => {
  res.send("Auth route is working");
});

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/refresh", refresh);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false,
  }),
  googleAuthCallback
);

router.get("/me", requireAuth, getCurrentUser);
router.get("/logout", logout);

export default router;
