import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const googleAuthCallback = (req: Request, res: Response) => {
  console.log("Authenticated user:", req.user); // Add this line to print the user
  // Successful authentication, redirect to frontend
  res.redirect(process.env.FRONTEND_URL || "http://localhost:5174/");
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
