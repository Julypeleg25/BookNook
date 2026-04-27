import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  googleBookId: string; // The ID from the External API (e.g., Google Books ID)
  title: string;
  authors: string[];
  thumbnail: string;
  avgRating: number;
  ratingCount: number;
  ratingSum: number;
}

const BookSchema: Schema = new Schema({
  googleBookId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  authors: [{ type: String }],
  thumbnail: { type: String },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IBook>("Book", BookSchema);