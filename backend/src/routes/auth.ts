import express from "express";
import passport from "passport";
import {
  googleAuthCallback,
  logout,
  register,
  login,
  refresh,
} from "@controllers/authController";
import { upload } from "@config/multerConfig";
import { validateBody } from "@middlewares/validateRequest";
import { LoginSchema, RegisterSchema } from "@shared/types/auth";

const router = express.Router();

router.post(
  "/register",
  upload.single("avatar"),
  validateBody(RegisterSchema),
  register
);
router.post("/login", validateBody(LoginSchema), login);
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

router.get("/logout", logout);

export default router;
