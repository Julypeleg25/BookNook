import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser, JwtDecodedUser } from "../models/User";
import dotenv from "dotenv";
dotenv.config();


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
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as JwtDecodedUser;

    const user = await User.findById(decoded.userId).select("_id");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user._id.toString(),
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
