import { Request, Response, NextFunction } from "express";
import { userRepository } from "@repositories/userRepository";
import { verifyAccessToken } from "@services/authService";
import { UnauthorizedError } from "@utils/errors";
import { logger } from "@utils/logger";
import jwt, { JwtPayload, VerifyErrors } from'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { COOKIE } from "@config/constants";
import { ENV } from "@config/config";

export interface AccessTokenPayload extends JwtPayload{
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: string;
}
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[COOKIE.ACCESS];

  if (!token) {
    return res.status(401).json({ message: "No session found" });
  }

  jwt.verify(token, ENV.JWT_ACCESS_SECRET, (err: VerifyErrors, decoded: AccessTokenPayload) => {
    // todo fix these types ^
    if (err) return res.status(401).json({ message: "Session expired" });
    req.user = decoded.userId;
    next();
  });
};