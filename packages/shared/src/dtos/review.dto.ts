import { z } from "zod";
import {
  COMMENT_TEXT_MAX_LENGTH,
  COMMENT_TEXT_MIN_LENGTH,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from "../constants/validation";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const ReviewCommentSchema = z.object({
  user: objectIdSchema,
  comment: z
    .string()
    .min(COMMENT_TEXT_MIN_LENGTH, "Comment cannot be empty")
    .max(
      COMMENT_TEXT_MAX_LENGTH,
      `Comment must be at most ${COMMENT_TEXT_MAX_LENGTH} characters`
    ),
  createdAt: z.coerce.date().optional(),
});

export const UserReviewZodSchema = z.object({
  user: objectIdSchema,
  book: objectIdSchema,
  review: z
    .string()
    .min(
      REVIEW_TEXT_MIN_LENGTH,
      `Review must be at least ${REVIEW_TEXT_MIN_LENGTH} characters long`
    )
    .max(
      REVIEW_TEXT_MAX_LENGTH,
      `Review must be at most ${REVIEW_TEXT_MAX_LENGTH} characters long`
    ),
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
