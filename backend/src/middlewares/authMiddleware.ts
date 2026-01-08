import { Request, Response, NextFunction } from "express";
import { userRepository } from "@repositories/userRepository";
import { verifyAccessToken } from "@services/authService";
import { UnauthorizedError } from "@utils/errors";
import { logger } from "@utils/logger";
import jwt, { JwtPayload, VerifyErrors } from'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { COOKIE } from "@config/constants";
import { ENV } from "@config/config";
import { getUserById } from "@services/userService";
import User from "@models/User";
import { sanitizeUser } from "@utils/userUtils";

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: {
        id: string;
        username: string;
        avatar?: string;
        email?: string;
      }
    }
  }
}
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    const user = await getUserById(decoded._id);

    if (!user) return res.status(401).json({ message: "User not found" });

    req.authenticatedUser = sanitizeUser(user);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
