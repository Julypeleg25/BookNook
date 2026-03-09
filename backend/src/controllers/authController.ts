import { Request, Response, NextFunction } from "express";
import {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from "@services/authService";
import { OAuth2Client } from "google-auth-library";
import { generateUsernameFromEmail, sanitizeUser } from "@utils/userUtils";
import {
  createUser,
  getUserByUsername,
  getUserByEmail,
  updateUserTokens,
  getUserById,
} from "@services/userService";
import { comparePassword } from "@utils/hashPassword";
import { ValidationError, UnauthorizedError } from "@utils/errors";
import { logger } from "@utils/logger";
import { isImageFile, deleteFile } from "@utils/fileUtils";
import { ENV } from "@config/config";
import { COOKIE } from "@config/constants";
import { HttpStatusCode } from "axios";
import { AuthResponseDto } from "@shared/dtos/auth.dto";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.file && !isImageFile(req.file.originalname)) {
      await deleteFile(req.file.path);
      throw new ValidationError("Avatar must be an image file");
    }

    const { email, username, password } = req.body;
    const avatarPath = req.file ? req.file.filename : undefined;
    const user = await createUser({
      username,
      email,
      provider: "local",
      password,
      avatar: avatarPath,
    });

    const { accessToken, refreshToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);
    setAuthCookies(res, refreshToken);

    const response: AuthResponseDto = {
      user: sanitizeUser(user),
      accessToken,
    };
    res.status(HttpStatusCode.Created).json(response);
  } catch (error: unknown) {
    if (req.file) await deleteFile(req.file.path);
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);
    if (!user?.password || !(await comparePassword(password, user.password))) {
      res.status(HttpStatusCode.Unauthorized).json({ message: "Invalid credentials" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);

    setAuthCookies(res, refreshToken);

    const response: AuthResponseDto = {
      accessToken,
      user: sanitizeUser(user),
    };
    res.json(response);
  } catch (error: unknown) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const oldRefreshToken = req.cookies[COOKIE.REFRESH] as string | undefined;
    if (!oldRefreshToken) {
      throw new UnauthorizedError("No refresh token");
    }

    const decoded = verifyRefreshToken(oldRefreshToken);
    const user = await getUserById(decoded._id);

    if (user.refreshToken !== oldRefreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const { accessToken, refreshToken } = generateTokens(user);

    setAuthCookies(res, refreshToken);
    await updateUserTokens(decoded._id, accessToken, refreshToken);

    res.json({ accessToken });
  } catch (error: unknown) {
    next(error);
  }
};

const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

export const googleSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== "string") {
      res.status(HttpStatusCode.BadRequest).json({ message: "Google credential is required" });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(HttpStatusCode.Unauthorized).json({ message: "Invalid Google token" });
      return;
    }

    const { email, picture } = payload;

    let user = await getUserByEmail(email);

    if (!user) {
      user = await createUser({
        email,
        username: generateUsernameFromEmail(email),
        avatar: picture,
        provider: "google",
        providerId: payload.sub,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);

    setAuthCookies(res, refreshToken);

    const response: AuthResponseDto = {
      accessToken,
      user: sanitizeUser(user),
    };
    res.json(response);
  } catch (error) {
    logger.error("Google authentication error:", error);
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.authenticatedUser?.id) {
      await updateUserTokens(req.authenticatedUser.id, null, null);
    }

    clearAuthCookies(res);
    res.status(HttpStatusCode.Ok).json({ success: true });
  } catch (error: unknown) {
    next(error);
  }
};
