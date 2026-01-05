import { Request, Response, NextFunction } from "express";
import { IUser } from "@models/User";
import {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from "@services/authService";
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

export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.redirect(`${ENV.FRONTEND_URL}/login`);

    const user = req.user as IUser;
    const { accessToken, refreshToken } = generateTokens(user);

    await updateUserTokens(String(user._id), accessToken, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(ENV.FRONTEND_URL);
  } catch (error) {
    logger.error("Google Auth Callback Error:", error);
    next(error);
  }
};

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
    setAuthCookies(res, accessToken, refreshToken);

    res.status(HttpStatusCode.Created).json({
      message: "User registered successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
      } as UserDto,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    if (
      !user ||
      !user.password ||
      !(await comparePassword(password, user.password))
    ) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
      } as UserDto,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies[COOKIE.REFRESH];

    if (!refreshToken) throw new UnauthorizedError("No refresh token");

    const decoded = await verifyRefreshToken(refreshToken);
    const user = await getUserById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const { accessToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);

    res.cookie(COOKIE.ACCESS, accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
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

    const userId = (req.user as IUser)?._id || req.authenticatedUser?._id;
    if (userId) {
      await updateUserTokens(String(userId), null, null);
    }

    clearAuthCookies(res);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
