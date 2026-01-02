import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import dotenv from "dotenv";
dotenv.config();
const { Schema } = mongoose;

export interface IUser extends Document {
  provider: string;
  username: string;
  email: string;
  password?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  providerId?: string;
  wishlist: mongoose.Types.ObjectId[];
  readlist: mongoose.Types.ObjectId[];
  refreshToken?: string; 
  accessToken?: string; 
  generateJWT: () => string;
  comparePassword: (
    candidatePassword: string,
    callback: (err: any, isMatch: boolean) => void
  ) => void;
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
    name: String,
    avatar: String,
    bio: String,
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book", // This must match the name in your Book model
      },
    ],
    readlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    // provider-specific id for OAuth (google, github, etc.)
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

const isProduction = process.env.NODE_ENV === "production";
const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

userSchema.methods.generateJWT = function (this: IUser) {
  const token = jwt.sign(
    {
      id: this._id,
      provider: this.provider,
      email: this.email,
    },
    secretOrKey!,
    {
      expiresIn: "12h",
    }
  );
  return token;
};

// Static method for registering a user
userSchema.statics.registerUser = async function (
  newUser: IUser,
  callback: (err: any, user?: IUser) => void
) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password || "", salt);
    newUser.password = hash;
    await newUser.save();
    callback(null, newUser);
  } catch (error) {
    callback(error);
  }
};

userSchema.methods.comparePassword = function (
  this: IUser,
  candidatePassword: string,
  callback: (err: any, isMatch: boolean) => void
) {
  if (!this.password) return callback(null, false);
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err, false);
    callback(null, isMatch);
  });
};

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return (await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) reject(err);
      else resolve(hash);
    });
  })) as string;
}

export const validateUser = (user: Partial<IUser>) => {
  const schema = Joi.object({
    avatar: Joi.any(),
    name: Joi.string().min(2).max(30).required(),
    username: Joi.string()
      .min(2)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/)
      .required(),
    password: Joi.string().min(6).max(20).allow("").allow(null),
    wishlist: Joi.array().items(Joi.string()), 
    readlist: Joi.array().items(Joi.string()),
  });
  return schema.validate(user);
};

interface UserModel extends Model<IUser> {
  registerUser(
    newUser: IUser,
    callback: (err: any, user?: IUser) => void
  ): void;
}

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
