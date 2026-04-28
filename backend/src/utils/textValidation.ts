import { ValidationError } from "@utils/errors";

interface TextValidationOptions {
  fieldLabel: string;
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
}

const normalizeText = (value: string): string => value.trim();

export const validateTextInput = (
  value: unknown,
  { fieldLabel, minLength, maxLength, allowEmpty = false }: TextValidationOptions
): string => {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldLabel} must be a string`);
  }

  const normalizedValue = normalizeText(value);

  if (!allowEmpty && normalizedValue.length === 0) {
    throw new ValidationError(`${fieldLabel} is required`);
  }

  if (minLength !== undefined && normalizedValue.length > 0 && normalizedValue.length < minLength) {
    throw new ValidationError(
      `${fieldLabel} must be at least ${minLength} characters long`
    );
  }

  if (maxLength !== undefined && normalizedValue.length > maxLength) {
    throw new ValidationError(
      `${fieldLabel} must be at most ${maxLength} characters long`
    );
  }

  return normalizedValue;
};

export const validateOptionalTextInput = (
  value: unknown,
  options: Omit<TextValidationOptions, "allowEmpty">
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return validateTextInput(value, options);
};
