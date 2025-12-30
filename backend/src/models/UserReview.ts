import mongoose, { Schema, Document, Types } from "mongoose";
import type { IUser } from "./User";
import { IBook } from "./Book";
// Populated comment with user object


export interface ReviewComment {
  user: Types.ObjectId;
  comment: string;
  createdAt: Date;
}

export interface IUserReview extends Document {
  user: Types.ObjectId;
  book: string; // Google Books volume ID
  review: string;
  rating: number; // 0-5, increments of 0.5
  picturePath?: string;
  comments: ReviewComment[];
  createdAt: Date;
  updatedAt: Date;
  likes: Types.ObjectId[];
}

const ReviewCommentSchema = new Schema<ReviewComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const UserReviewSchema = new Schema<IUserReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: String, required: true },
    review: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      validate: {
        validator: (v: number) => v * 2 === Math.floor(v * 2),
        message: (props) =>
          `${props.value} is not a valid rating (increments of 0.5)!`,
      },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    picturePath: { type: String },
    comments: [ReviewCommentSchema],
  },
  { timestamps: true }
);

export const UserReviewModel = mongoose.model<IUserReview>(
  "UserReview",
  UserReviewSchema
);
