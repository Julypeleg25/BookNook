import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { JwtDecodedUser } from "../models/User";
import { IUser } from "../models/User";
import dotenv from "dotenv";
import {Types } from "mongoose";
dotenv.config();

export async function getFullUser(userId: Types.ObjectId): Promise<IUser | null> {
  return await User.findById(userId);
}


