import express from "express";
import passport from "passport";
import { googleAuthCallback, logout } from "../controllers/authController";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Auth route is working");
});
// Initiates the Google OAuth process
router.get(
  "/google",
  (req, res, next) => {
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/oauth2/redirect/google",
  (req, res, next) => {
    next();
  },
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthCallback
);

// Logout
router.get("/logout", logout);

// Get current user
router.get("/me", (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
