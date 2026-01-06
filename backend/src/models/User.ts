import mongoose, { Document, Model } from "mongoose";

const { Schema } = mongoose;

export interface IUser extends Document {
  provider: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  providerId?: string;
  wishlist: string[];
  readlist: string[];
  refreshToken?: string;
  accessToken?: string;
}

export interface JwtDecodedUser {
  userId: string;
  email: string;
}

const userSchema = new Schema<IUser>(
  {
    provider: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9_]+$/, "is invalid"],
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
      minlength: 6,
      maxlength: 60,
    },
    avatar: String,
    bio: String,
    wishlist: {
      type: [String],
      default: [],
    },
    readlist: {
      type: [String],
      default: [],
    },
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
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
