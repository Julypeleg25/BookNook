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
import dotenv from 'dotenv'
dotenv.config();
const router = express.Router();

router.get("/", (_req, res) => {
  res.send("Auth route is working");
});

// Local auth
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// Google OAuth
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

// Protected routes
router.get("/me", requireAuth, (req: any, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
  });
});

router.get("/logout", logout);

export default router;
