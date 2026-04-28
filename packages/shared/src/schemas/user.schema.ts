import z from "zod";

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(30, "Name must be at most 30 characters").optional(),
  username: z
    .string()
    .trim()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores")
    .optional(),
  avatar: z.string().optional(),
});
