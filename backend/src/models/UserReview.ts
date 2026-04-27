import mongoose, { Schema, Document, Types } from "mongoose";
import {
  COMMENT_TEXT_MAX_LENGTH,
  COMMENT_TEXT_MIN_LENGTH,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from "@shared/constants/validation";

export interface ReviewComment {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  comment: string;
  createdAt: Date;
  createdDate?: Date;
  content?: string;
}

export interface IUserReview extends Document {
  user: Types.ObjectId;
  book: Types.ObjectId;
  review: string;
  rating: number;
  picturePath?: string;
  comments: ReviewComment[];
  createdAt: Date;
  updatedAt: Date;
  likes: Types.ObjectId[];
  imageUrl?: string;
  description?: string;
  createdDate?: Date;
}

const ReviewCommentSchema = new Schema<ReviewComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: {
      type: String,
      required: true,
      minLength: COMMENT_TEXT_MIN_LENGTH,
      maxLength: COMMENT_TEXT_MAX_LENGTH,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ReviewCommentSchema.virtual("createdDate").get(function () {
  return this.createdAt;
});

ReviewCommentSchema.virtual("content").get(function () {
  return this.comment;
});

const UserReviewSchema = new Schema<IUserReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    review: {
      type: String,
      required: true,
      minLength: REVIEW_TEXT_MIN_LENGTH,
      maxlength: REVIEW_TEXT_MAX_LENGTH,
    },
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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserReviewSchema.virtual("imageUrl").get(function () {
  return this.picturePath;
});

UserReviewSchema.virtual("description").get(function () {
  return this.review;
});

UserReviewSchema.virtual("createdDate").get(function () {
  return this.createdAt;
});

export const UserReviewModel = mongoose.model<IUserReview>(
  "UserReview",
  UserReviewSchema
);
