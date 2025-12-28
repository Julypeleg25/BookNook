import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  bookId: string;
  avgRating: number;
  ratingCount: number;
  ratingSum: number; // optional, for incremental updates if needed later
}

const BookSchema: Schema = new Schema({
  bookId: { type: String, required: true, unique: true },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 },
});

export default mongoose.model<IBook>("Book", BookSchema);
