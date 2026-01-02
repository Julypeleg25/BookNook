import { Request, Response } from "express";
import User from "../models/User";
import Book, { IBook } from "../models/Book";

export const addBookToUserList = 
async (req: Request<{}, {}, { listType: 'wish' | 'read' , book: 
  IBook}>, res: Response) => {
    const { listType } = req.body;

  try {
    const { _id } = req.authenticatedUser!; 
    const {  googleBookId, title, authors, thumbnail } = req.body.book;

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

    if (listType === 'read') {
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { $addToSet: { readlist: book._id } },
        { new: true }
      ).populate("readlist");  
      return res.status(200).json({
        message: "Book added to read list",
        readlist: updatedUser?.readlist
      });}

    if (listType === 'wish') {
  
    const updatedUser = await User.findByIdAndUpdate(
       _id,
      { $addToSet: { wishlist: book._id } },
      { new: true }
    ).populate("wishlist");

    return res.status(200).json({
      message: "Book added to wishlist",
      wishlist: updatedUser?.wishlist
    });
  }

  } catch (error) {
    return res.status(500).json({ message: `Error adding to ${listType} list`, error });
  }
};