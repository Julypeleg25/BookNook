import express, { Request, Response } from "express";
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
import { IUser } from "../models/User";
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
router.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({
    id: req.authenticatedUser!._id,
    email: req.authenticatedUser!.email,
    name: req.authenticatedUser!.name,
  });
});

router.get("/logout", logout);

export default router;
