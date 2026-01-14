import { Response } from "express";
import jwt, { JwtPayload, VerifyCallback } from "jsonwebtoken";
import { IUser, JwtDecodedUser } from "@models/User";
import { logger } from "@utils/logger";
import { UnauthorizedError } from "@utils/errors";
import { ENV } from "@config/config";

export function generateTokens(user: IUser): { accessToken: string; refreshToken: string } {
  try {
    const accessToken = jwt.sign(
      {  _id: user._id} ,
      ENV.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {  _id: user._id },
      ENV.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error("Error generating tokens:", error);
    throw error;
  }
}

export function setAuthCookies(
  res: Response,
  refreshToken: string
): void {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> 
{  try {
    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET!)
    
    if (typeof decoded === "string") {
      throw new UnauthorizedError("Invalid refresh token payload");
    }

    return decoded

  } catch (error) {
    logger.error("Error verifying refresh token:", error);
    throw new UnauthorizedError("Invalid refresh token");
  }
}

export function verifyAccessToken(token: string): JwtDecodedUser {
  try {
    return jwt.verify(token, ENV.JWT_ACCESS_SECRET!) as JwtDecodedUser;
  } catch (error) {
    logger.error("Error verifying access token:", error);
    throw new UnauthorizedError("Invalid access token");
  }
}
