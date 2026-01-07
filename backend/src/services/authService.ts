import { Response } from "express";
import jwt, { VerifyCallback } from "jsonwebtoken";
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

// todo only store refresh
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  // res.cookie("accessToken", accessToken, {
  //   httpOnly: true,
  //   secure: ENV.NODE_ENV === "production",
  //   sameSite: "lax",
  //   maxAge: 15 * 60 * 1000,
  // });
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

export async function verifyRefreshToken(token: string): Promise<{_id: string}> {//todo type better{ _id: '6946995e00032e109176ab2e', iat: 1767820672, exp: 1768425472 }
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET!) as {_id: string};
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
