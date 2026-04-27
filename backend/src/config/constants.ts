export const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

export const COOKIE = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
} as const;

export const SALT_ROUNDS = 10;

export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"] as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
