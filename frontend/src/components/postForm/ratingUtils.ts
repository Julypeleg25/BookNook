import {
  RATING_MAX,
  RATING_STEP,
} from "@shared/constants/validation";

const RATING_EPSILON = 1e-8;
const EMPTY_RATING = 0;
const MIN_SELECTABLE_RATING = RATING_STEP;

export const normalizeRating = (value: unknown): number => {
  const numericRating = Number(value);
  return Number.isFinite(numericRating) ? numericRating : EMPTY_RATING;
};

const isRatingStepAligned = (value: number): boolean =>
  Math.abs(value / RATING_STEP - Math.round(value / RATING_STEP)) < RATING_EPSILON;

export const isAllowedRating = (value: unknown): boolean => {
  const numericRating = normalizeRating(value);
  return (
    numericRating >= MIN_SELECTABLE_RATING &&
    numericRating <= RATING_MAX &&
    isRatingStepAligned(numericRating)
  );
};

export const validateRating = (value: unknown): true | string =>
  isAllowedRating(value) || "Choose a rating";
