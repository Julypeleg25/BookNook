import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const googleAuthCallback = (req: Request, res: Response) => {
  console.log("Google auth callback called");
  console.log("Authenticated user:", req.user);
  // Issue JWT for Google users
  if (req.user) {
    console.log(req.user);
    const accessToken = jwt.sign(
      { userId: (req.user as any)._id, email: (req.user as any).email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId: (req.user as any)._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });
    console.log(
      "Redirecting to",
      `${process.env.FRONTEND_URL}?token=${accessToken}`
    );
    res.redirect(`${process.env.FRONTEND_URL}?token=${accessToken}`);
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
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
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
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false });
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token" });
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as any;
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "Invalid refresh token" });
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  console.log("Logout called");
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie("refreshToken");
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
  });
};
