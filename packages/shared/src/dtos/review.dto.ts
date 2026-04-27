import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const ReviewCommentSchema = z.object({
  user: objectIdSchema,
  comment: z.string().min(1, "Comment cannot be empty").max(200, "Comment must be at most 200 characters"),
  createdAt: z.coerce.date().optional(),
});

export const UserReviewZodSchema = z.object({
  user: objectIdSchema,
  book: objectIdSchema,
  review: z
    .string()
    .min(5, "Review must be at least 5 characters long")
    .max(1500, "Review must be at most 1500 characters long"),
  rating: z
    .number()
    .min(0)
    .max(5)
    .refine((n) => (n * 2) % 1 === 0, {
      message: "Rating must be in increments of 0.5",
    }),
  likes: z.array(objectIdSchema).default([]),
  picturePath: z.string().optional(),
  comments: z.array(ReviewCommentSchema).default([]),
});

export const CreateUserReviewSchema = UserReviewZodSchema.omit({
  likes: true,
  comments: true,
});

export type ReviewCommentDTO = z.infer<typeof ReviewCommentSchema>;
export type UserReviewDTO = z.infer<typeof UserReviewZodSchema>;
export type CreateUserReviewDTO = z.infer<typeof CreateUserReviewSchema>;
