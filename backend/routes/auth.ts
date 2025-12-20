import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  googleAuthCallback,
  logout,
  register,
  login,
  refresh,
} from "../controllers/authController";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Auth route is working");
});

// Traditional auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

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
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleAuthCallback
);

// Logout
router.get("/logout", logout);

// Get current user (requires JWT)
router.get("/me", (req, res) => {
  console.log("/me endpoint called", req.headers.authorization);
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    // Fetch user from DB if needed, but for simplicity, return decoded
    res.json({ userId: decoded.userId, email: decoded.email });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
