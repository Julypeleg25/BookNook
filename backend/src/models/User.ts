import mongoose, { Document, Model } from "mongoose";

const { Schema } = mongoose;

// todo IUSER, USERDTO user model.. too many
export interface IUser extends Document {
  provider: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  bio?: string;
  providerId?: string;
  wishlist: string[];
  readlist: string[];
  refreshToken?: string;
  accessToken?: string;
  googleId?: string;   
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
      enum: ['local', 'google'], // Good practice to restrict values
      default: 'local'
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
      // REMOVE required: true if it was there, or keep it optional
      // Google users will not have a password
      minlength: 6,
      maxlength: 60,
    },
    googleId: { type: String, unique: true, sparse: true }, 
    avatar: {type: String, required: true},
    bio: String,
    providerId: {
      type: String,
      unique: true,
      sparse: true, // IMPORTANT: Allows multiple 'null' values for local users
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
