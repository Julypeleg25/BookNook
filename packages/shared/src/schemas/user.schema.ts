import z from "zod";

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(30).optional(),
  username: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatar: z.string().optional(),
});
