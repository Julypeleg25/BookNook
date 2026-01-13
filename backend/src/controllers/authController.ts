import { Request, Response, NextFunction } from "express";
import User, { IUser } from "@models/User";
import {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from "@services/authService";
import { OAuth2Client } from "google-auth-library";
import { generateUsernameFromEmail, sanitizeUser } from "../utils/userUtils";
import {
  createUser,
  getUserByUsername,
  updateUserTokens,
  getUserById,
} from "@services/userService";
import { comparePassword, hashPassword } from "@utils/hashPassword";
import { ValidationError, UnauthorizedError } from "@utils/errors";
import { logger } from "@utils/logger";
import { isImageFile, deleteFile } from "@utils/fileUtils";
import { ENV } from "@config/config";
import { COOKIE } from "@config/constants";
import { HttpStatusCode } from "axios";
import { UserDto } from "@shared/dtos/user.dto";
import { AuthResponseDto } from "@shared/index";
import jwt from "jsonwebtoken";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.file && !isImageFile(req.file.originalname)) {
      deleteFile(req.file.path);
      throw new ValidationError("Avatar must be an image file");
    }

    const { name, email, username, password } = req.body;
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      name,
      username,
      email,
      provider: "local",
      password: hashedPassword,
      avatar: avatarPath,
    });

    const { accessToken, refreshToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);
    setAuthCookies(res, refreshToken);

    res.status(HttpStatusCode.Created).json(sanitizeUser(user));
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await getUserByUsername(username);
  if (!user || !(await comparePassword(password, user.password!))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = generateTokens(user);
  await updateUserTokens(user._id.toString(), accessToken, refreshToken);

  setAuthCookies(res, refreshToken);
  res.json({
    accessToken,
    user: sanitizeUser(user),
  });
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const oldRefreshToken = req.cookies[COOKIE.REFRESH];
    if (!oldRefreshToken) throw new UnauthorizedError("No refresh token");

    const decoded = await verifyRefreshToken(oldRefreshToken);
    const user = await getUserById(decoded._id);

    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const { accessToken, refreshToken } = generateTokens(user);

    setAuthCookies(res, refreshToken);

    updateUserTokens(decoded._id.toString(), accessToken, refreshToken);
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
export const googleAuthenticate = async (req: Request, res: Response) => {
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: ENV.GOOGLE_CLIENT_ID,
  });

  const { email, sub, picture } = ticket.getPayload()!;
  if (!email) return res.status(401).json({ message: "No email" });

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      username: generateUsernameFromEmail(email),
      googleId: sub,
      avatar: picture,
      provider: "google",
    });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  setAuthCookies(res, refreshToken);
  res.json({
    accessToken,
    user: sanitizeUser(user),
  });
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.logout((err) => {
      if (err) logger.error("Passport logout error:", err);
    });

    clearAuthCookies(res);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
