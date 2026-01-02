import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  externalId: string;
  avgRating: number;
  ratingCount: number;
  ratingSum: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    externalId: { type: String, required: true, unique: true },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BookModel = mongoose.model<IBook>("Book", BookSchema);
