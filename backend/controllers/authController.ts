import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { JwtDecodedUser } from "../models/User";
import { IUser } from "../models/User";
import dotenv from "dotenv";
dotenv.config();
// Generate JWT tokens

function generateTokens(user: IUser) {
  console.log(user._id, user.email, process.env.JWT_ACCESS_SECRET);
  const accessToken = jwt.sign(
    {userId: user._id, email: user.email } ,
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

// Set tokens as HTTP-only cookies
function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
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

// Save tokens to user in DB
async function saveTokensToUser(id: string, accessToken: string, refreshToken: string) {
  await User.findByIdAndUpdate(id, { accessToken, refreshToken });
}

export const googleAuthCallback = async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as any;
    const { accessToken, refreshToken } = generateTokens(user);
    await saveTokensToUser(user._id, accessToken, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch {
    res.status(400).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ success: true });
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

    // Rotate access token
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


export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(async (err) => {
    if (err) return next(err);
    if (req.user) {
      await User.findByIdAndUpdate((req.user as any)._id, { refreshToken: null, accessToken: null });
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  });
};
