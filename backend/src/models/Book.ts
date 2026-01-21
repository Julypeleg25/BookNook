import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  externalId: string;
  categories: string[];
  title: string;
  authors: string[];
  thumbnail?: string;
  publishedDate?: string;

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

    avgRating: { type: Number, default: 0, index: true },
    ratingCount: { type: Number, default: 0, index: true },
    ratingSum: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BookModel = mongoose.model<IBook>("Book", BookSchema);
