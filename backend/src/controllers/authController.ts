import { Request, Response, NextFunction } from "express";
import User, { IUser } from "@models/User";
import {
  generateTokens,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from "@services/authService";
import { OAuth2Client } from "google-auth-library";
import {generateUsernameFromEmail} from '../utils/userUtils'
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
import jwt from "jsonwebtoken"


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
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
      } ,
      accessToken
    } as AuthResponseDto);
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
};

// controllers/authController.ts

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.redirect(`${ENV.FRONTEND_URL}/login`);

    const user = req.user as IUser;
    const { accessToken, refreshToken } = generateTokens(user);

    await updateUserTokens(String(user._id), accessToken, refreshToken);

    // Set Refresh Token Cookie (Long lived)
    setAuthCookies(res, accessToken, refreshToken)

   res.json({
      user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      },
      accessToken
      }  as AuthResponseDto);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    if (!user || !user.password || !(await comparePassword(password, user.password))) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await updateUserTokens(String(user._id), accessToken, refreshToken);

    // Store refresh token in httpOnly cookie and return accessToken in JSON
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: { id: user._id, username: user.username, email: user.email },
      accessToken,
    });
  } catch (error) { next(error); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldRefreshToken = req.cookies[COOKIE.REFRESH];
    if (!oldRefreshToken) throw new UnauthorizedError("No refresh token");

    const decoded = await verifyRefreshToken(oldRefreshToken);
    const user = await getUserById(decoded._id);

    if (!user || user.refreshToken !== oldRefreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const { accessToken, refreshToken } = generateTokens(user);
    
    // Return fresh access token to be stored in Frontend State (JS Memory)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      updateUserTokens(decoded._id.toString(), accessToken, refreshToken)
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};



const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
export const generateTokensFromGoogleAuth = async (req: Request, res: Response) => {
  try {
    // await User.deleteOne({email: "2003yam@gmail.com"})
    // return; todo delete 
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub, picture } = ticket.getPayload()!;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, username: generateUsernameFromEmail(email), googleId: sub, avatar: picture , provider: "google"});
      await user.save();
    }

    // todo - one jwt sign 
    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '1m' }
    );
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_SECRET!,
      {expiresIn: '7d'}
    );

    await updateUserTokens(user._id.toString(), accessToken, refreshToken)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    const userResponse :  AuthResponseDto =  { accessToken, user: {id :user._id.toString(), 
      avatar: user.avatar, email:user.email, username: user.username} }

    res.json( userResponse
      )
    return;
  } catch (error) {
    console.error("Error during Google authentication:", error);
    res
      .status(401)
      .json({ error: "Invalid Google token", details: error.message });
    return;
  }}

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

