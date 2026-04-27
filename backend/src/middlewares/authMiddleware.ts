import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@services/authService";
import { getUserById } from "@services/userService";
import { sanitizeUser } from "@utils/userUtils";
import { logger } from "@utils/logger";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Invalid authorization header" });
      return;
    }

    const decoded = verifyAccessToken(token);
    const user = await getUserById(decoded._id);

    req.authenticatedUser = sanitizeUser(user);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
