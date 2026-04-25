import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { JwtDecodedUser } from "../models/User";
import { IUser } from "../models/User";
import dotenv from "dotenv";
dotenv.config();

function generateTokens(user: IUser) {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function saveTokensToUser(
  id: string,
  accessToken: string,
  refreshToken: string
) {
  await User.findByIdAndUpdate(id, { accessToken, refreshToken });
}

export const googleAuthCallback = async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as IUser;
    const { accessToken, refreshToken } = generateTokens(user);
    await saveTokensToUser(user._id.toString(), accessToken, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);
    res.redirect(
      (process.env.FRONTEND_URL || "http://localhost:5173") + "/dashboard"
    );
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      username,
      provider: "local",
      password: hashedPassword,
    });
    await user.save();
    const { accessToken, refreshToken } = generateTokens(user);
    await saveTokensToUser(String(user._id), accessToken, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        refreshToken: user.refreshToken,
        accessToken: user.accessToken,
      },
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as JwtDecodedUser;

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const { accessToken } = generateTokens(user);
    user.accessToken = accessToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
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
      await User.findByIdAndUpdate((req.authenticatedUser._id), {
        refreshToken: null,
        accessToken: null,
      });
    }

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
