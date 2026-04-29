import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBook extends Document {
  _id: Types.ObjectId;
  externalId: string;
  categories: string[];
  title: string;
  authors: string[];
  thumbnail?: string;
  publishedDate?: string;
  description?: string;

  avgRating: number;
  ratingCount: number;
  ratingSum: number;

  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },

    title: { type: String, required: true, index: true },
    authors: { type: [String], default: [], index: true },
    categories: { type: [String], default: [] },
    thumbnail: String,
    publishedDate: String,
    description: String,

    avgRating: { type: Number, default: 0, index: true },
    ratingCount: { type: Number, default: 0, index: true },
    ratingSum: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const BookModel = mongoose.model<IBook>("Book", BookSchema);
