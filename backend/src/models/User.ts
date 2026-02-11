import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  provider: "local" | "google";
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
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    readlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
