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

export interface AccessTokenPayload extends JwtPayload{
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: string;
}
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 2. Check if header exists and starts with 'Bearer '
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  // 3. Take the 'Bearer ' out (split by space and take the second part)
  const accessToken = authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "No session found" });
  }

  jwt.verify(accessToken, ENV.JWT_ACCESS_SECRET, async  (err: VerifyErrors, decoded: AccessTokenPayload) => {
    // todo fix these types ^
    if (err) return res.status(401).json({ message: "Session expired" });

    try{
   const fullAuthenticatedUser = await getUserById(decoded._id)
    const {_id: id, name , username , avatar, email } = fullAuthenticatedUser
    req.authenticatedUser = {id, name , username, avatar, email }
    next();
    }catch(error){
      throw error //todo what to do error in middleware
    }
 
  });
};