import type { Request } from "express";
import {
  RATING_MAX,
  RATING_MIN,
  RATING_STEP,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
  SEARCH_QUERY_MAX_LENGTH,
} from "@shared/constants/validation";
import { ValidationError } from "@utils/errors";
import { validateOptionalTextInput, validateTextInput } from "@utils/textValidation";

const RATING_EPSILON = 1e-8;

export interface GetAllReviewsQuery {
  minLikes?: number;
  searchQuery?: string;
  username?: string;
  rating?: number;
  genre?: string;
}

export interface ReviewUpdateInput {
  review?: string;
  rating?: number;
  picturePath?: string;
}

const isRatingStepValid = (rating: number): boolean => {
  const steps = rating / RATING_STEP;
  return Math.abs(steps - Math.round(steps)) < RATING_EPSILON;
};

export const parseRating = (rating: unknown): number => {
  const parsedRating = Number(rating);
  if (
    Number.isNaN(parsedRating) ||
    parsedRating < RATING_MIN ||
    parsedRating > RATING_MAX ||
    !isRatingStepValid(parsedRating)
  ) {
    throw new ValidationError(
      `Rating must be a number between ${RATING_MIN} and ${RATING_MAX} in ${RATING_STEP} increments`,
    );
  }

  return parsedRating;
};

export const validateReviewText = (review: unknown): string => {
  return validateTextInput(review, {
    fieldLabel: "Review",
    minLength: REVIEW_TEXT_MIN_LENGTH,
    maxLength: REVIEW_TEXT_MAX_LENGTH,
  });
};

export const validateOptionalReviewText = (review: unknown): string | undefined => {
  return validateOptionalTextInput(review, {
    fieldLabel: "Review",
    minLength: REVIEW_TEXT_MIN_LENGTH,
    maxLength: REVIEW_TEXT_MAX_LENGTH,
  });
};

export const parseGetAllReviewsQuery = (query: Request["query"]): GetAllReviewsQuery => {
  const minLikes = query.minLikes ? Number(query.minLikes) : undefined;
  const username = query.username ? String(query.username) : undefined;
  const rawSearchQuery = query.search ? String(query.search).trim() : undefined;
  const searchQuery = rawSearchQuery
    ? validateTextInput(rawSearchQuery, {
        fieldLabel: "Search query",
        maxLength: SEARCH_QUERY_MAX_LENGTH,
      })
    : undefined;
  const rating = query.rating ? Number(query.rating) : undefined;
  const genre = query.genre ? String(query.genre) : undefined;

  return {
    minLikes,
    searchQuery,
    username,
    rating,
    genre,
  };
};
