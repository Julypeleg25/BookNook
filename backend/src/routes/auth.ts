import express from "express";
import {
  logout,
  register,
  login,
  refresh,
  googleAuthenticate,
} from "@controllers/authController";
import { upload } from "@config/multerConfig";
import { validateBody } from "@middlewares/validateRequest";
import { RegisterSchema, LoginSchema } from "@shared/schemas/auth.schema";

const router = express.Router();

router.post("/register", upload.single("avatar"), validateBody(RegisterSchema), register);
router.post("/login", validateBody(LoginSchema), login);
router.post("/refresh", refresh);

router.post("/google", googleAuthenticate);

router.get("/logout", logout);

export default router;
