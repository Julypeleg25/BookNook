import { z } from "zod";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  REQUIRED_TEXT_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "../constants/validation";

export const RegisterSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
    .max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters`)
    .regex(/^[\p{L}\p{N}_]+$/u, "Use only letters, numbers, and underscores"),
  email: z.email("Invalid email address").trim().toLowerCase(),
  avatar: z.any().optional(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
    .regex(
      /^(?=.*\p{L})(?=.*\d)[\s\S]+$/u,
      "Password must contain at least one letter and one number"
    ),
});

export const LoginSchema = z.object({
  username: z.string().trim().min(REQUIRED_TEXT_MIN_LENGTH, "Username is required"),
  password: z.string().min(REQUIRED_TEXT_MIN_LENGTH, "Password is required"),
});
