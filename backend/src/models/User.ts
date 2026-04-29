import mongoose, { Document, Schema } from "mongoose";
import {
  PASSWORD_MIN_LENGTH,
  STORED_PASSWORD_MAX_LENGTH,
} from "@shared/constants/validation";

export interface IUser extends Document {
  provider: "local" | "google";
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  providerId?: string;
  wishlist: string[];
  refreshToken?: string;
  accessToken?: string;
  googleId?: string;
}

const userSchema = new Schema<IUser>(
  {
    provider: {
      type: String,
      required: true,
      enum: ["local", "google"],
      default: "local",
    },
    username: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[\p{L}\p{N}_]+$/u, "is invalid"],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: PASSWORD_MIN_LENGTH,
      maxlength: STORED_PASSWORD_MAX_LENGTH,
      required: false,
    },
    googleId: { type: String, unique: true, sparse: true },
    avatar: String,
    bio: String,
    providerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    accessToken: {
      type: String,
      default: null,
    },

    wishlist: [
      {
        type: String,
      },
    ],

  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
