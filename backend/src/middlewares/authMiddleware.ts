import { Request, Response, NextFunction } from "express";
import { userRepository } from "@repositories/userRepository";
import { verifyAccessToken } from "@services/authService";
import { UnauthorizedError } from "@utils/errors";
import { logger } from "@utils/logger";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    req.authenticatedUser = user;
    next();
  } catch (error: any) {
    logger.error("Authentication error:", error);
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
