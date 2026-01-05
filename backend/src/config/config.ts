import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "access-secret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  COOKIE_SECURE: process.env.NODE_ENV === "production",
};
