import { Response } from "express";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { IUser } from "@models/User";
import { logger } from "@utils/logger";
import { UnauthorizedError } from "@utils/errors";
import { ENV } from "@config/config";
import { COOKIE } from "@config/constants";

export interface TokenPayload extends JwtPayload {
  _id: string;
}

export const generateTokens = (
  user: IUser
): { accessToken: string; refreshToken: string } => {
  try {
    const accessToken = jwt.sign({ _id: user._id }, ENV.JWT_ACCESS_SECRET, {
      expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    });
    const refreshToken = jwt.sign({ _id: user._id }, ENV.JWT_REFRESH_SECRET, {
      expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    });
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error("Error generating tokens:", error);
    throw error;
  }
};

export const setAuthCookies = (res: Response, refreshToken: string): void => {
  res.cookie(COOKIE.REFRESH, refreshToken, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(COOKIE.ACCESS, { path: "/" });
  res.clearCookie(COOKIE.REFRESH, { path: "/" });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET);

    if (typeof decoded === "string") {
      throw new UnauthorizedError("Invalid refresh token payload");
    }

    return decoded as TokenPayload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    logger.error("Error verifying refresh token:", error);
    throw new UnauthorizedError("Invalid refresh token");
  }
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET);

    if (typeof decoded === "string") {
      throw new UnauthorizedError("Invalid access token payload");
    }

    return decoded as TokenPayload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    logger.error("Error verifying access token:", error);
    throw new UnauthorizedError("Invalid access token");
  }
};
