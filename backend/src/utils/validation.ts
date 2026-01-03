import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().trim().min(6).max(20).required(),
});

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(30).required(),
  username: Joi.string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(6).max(20).required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(30).optional(),
  username: Joi.string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  avatar: Joi.string().optional(),
});

export const reviewSchema = Joi.object({
  bookId: Joi.string().required(),
  review: Joi.string().optional(),
  rating: Joi.number().min(0).max(5).required(),
});

