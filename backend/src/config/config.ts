import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URL: requireEnv("MONGODB_URL"),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  COOKIE_SECURE: process.env.NODE_ENV === "production",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_CLIENT_ID: requireEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ??
    "http://localhost:3000/oauth2/redirect/google",
  SESSION_SECRET: requireEnv("SESSION_SECRET"),
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY ?? "",
  GOOGLE_BOOKS_API:
    process.env.GOOGLE_BOOKS_API ??
    "https://www.googleapis.com/books/v1/volumes",
} as const;
