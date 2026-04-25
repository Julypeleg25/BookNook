import { Request, Response } from "express";
import User from "../models/User";
import Book from "../models/Book";

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body; 
    const { googleBookId, title, authors, thumbnail } = req.body.book;

    // 1. "Upsert" the book: Find it by external ID, or create it if missing
    const book = await Book.findOneAndUpdate(
      { googleBookId: googleBookId },
      { 
        $setOnInsert: { 
          title, 
          authors, 
          thumbnail,
          avgRating: 0,
          ratingCount: 0,
          ratingSum: 0 
        } 
      },
      { upsert: true, new: true }
    );

    // 2. Add the book's internal _id to the user's wishlist
    // $addToSet prevents adding the same book multiple times
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: book._id } },
      { new: true }
    ).populate("wishlist");

    return res.status(200).json({
      message: "Book added to wishlist",
      wishlist: updatedUser?.wishlist
    });

  } catch (error) {
    return res.status(500).json({ message: "Error adding to wishlist", error });
  }
};