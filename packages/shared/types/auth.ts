import z from "zod";

export const LoginSchema = z.object({
  username: z.string().trim(),
  password: z.string().trim().min(6).max(20),
});

export const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(30),
  username: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email(),
  password: z.string().trim().min(6).max(20),
});

export type LoginRequestDTO = z.infer<typeof LoginSchema>;
export type RegisterRequestDTO = z.infer<typeof RegisterSchema>;
