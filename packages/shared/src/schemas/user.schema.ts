import z from "zod";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
} from "../constants/validation";

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(USER_NAME_MIN_LENGTH, `Name must be at least ${USER_NAME_MIN_LENGTH} characters`)
    .max(USER_NAME_MAX_LENGTH, `Name must be at most ${USER_NAME_MAX_LENGTH} characters`)
    .optional(),
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
    .max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters`)
    .regex(/^[\p{L}\p{N}_]+$/u, "Use only letters, numbers, and underscores")
    .optional(),
  avatar: z.string().optional(),
});
