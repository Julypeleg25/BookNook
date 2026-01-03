import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/User";
import {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
} from "../services/authService";
import {
  createUser,
  getUserByUsername,
  updateUserTokens,
  getUserById,
} from "../services/userService";
import { comparePassword, hashPassword } from "../utils/password";
import { registerSchema } from "../utils/validation";
import { ValidationError, UnauthorizedError } from "../utils/errors";
import { logger } from "../utils/logger";
import { isImageFile, deleteFile } from "../utils/fileUtils";

export const googleAuthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user) {
      const user = req.user as IUser;
      const { accessToken, refreshToken } = generateTokens(user);
      await updateUserTokens(String(user._id), accessToken, refreshToken);
      setAuthCookies(res, accessToken, refreshToken);
      res.redirect(
        (process.env.FRONTEND_URL || "http://localhost:5173") + "/dashboard"
      );
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  } catch (error) {
    logger.error("Error in Google auth callback:", error);
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ValidationError("Avatar is required");
    }

    if (!isImageFile(req.file.originalname)) {
      deleteFile(req.file.path);
      throw new ValidationError("Avatar must be an image file");
    }

    const { name, email, username, password } = req.body;
    const { error } = registerSchema.validate({
      name,
      email,
      username,
      password,
    });
    if (error) {
      deleteFile(req.file.path);
      throw new ValidationError(
        error.details && error.details[0]
          ? error.details[0].message
          : "error at registering user"
      );
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      name,
      email,
      username,
      provider: "local",
      password: hashedPassword,
      avatar: avatarPath,
    });

    const { accessToken, refreshToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    logger.error("Registration error:", error);
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
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    logger.error("Login error:", error);
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthorizedError("No refresh token");
    }

    const { verifyRefreshToken } = await import("../services/authService");
    const decoded = await verifyRefreshToken(refreshToken);
    const user = await getUserById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const { accessToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ error: error.message });
    }
    logger.error("Refresh token error:", error);
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
      if (err) return next(err);
    });

    if (req.authenticatedUser) {
      await updateUserTokens(String(req.authenticatedUser._id), null, null);
    }

    clearAuthCookies(res);
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("Logout error:", err);
    next(err);
  }
};
