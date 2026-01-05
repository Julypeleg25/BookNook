import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URL: process.env.MONGODB_URL || "mongodb://localhost:27017/booknook",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "access-secret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  COOKIE_SECURE: process.env.NODE_ENV === "production",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CLIENT_ID ||
    "http://localhost:3000/oauth2/redirect/google",
  SESSION_SECRET: process.env.GOOGLE_CLIENT_ID || "your-session-secret",
  JWT_ACCESS_SECRET: process.env.GOOGLE_CLIENT_ID || "your-access-secret",
  JWT_REFRESH_SECRET: process.env.GOOGLE_CLIENT_ID || "your-refresh-secret",
  GOOGLE_BOOKS_API_KEY: "",
  GOOGLE_BOOKS_API:
    process.env.GOOGLE_BOOKS_API ||
    "https://www.googleapis.com/books/v1/volumes",
};
