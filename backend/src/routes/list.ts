import express, { Request, Response } from "express";
import { addBookToUserList } from "../controllers/listController";
import { getBookById } from "./books";
import { getFullUser } from "../controllers/userController";
import Book from "../models/Book";
import User from "../models/User";
const router = express.Router();

router.post("/:bookId", async (req: Request, res: Response) => {
  try {
    const userId = req.authenticatedUser!._id;
    const { bookId } = req.params;
    const {listType} = req.body;
    const updatedList = await addBookToUserList(userId, bookId, listType);
    res.json({ updatedList });
  } catch {
    res.status(500).json({ message: "Failed to fetch book" });
  }
})

router.get("/wishlist", async (req: Request, res: Response) => {
  try {
    const userId = req.authenticatedUser!._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const fullUser = await getFullUser(userId);
    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    };

    const fullBooksOfWishlist = await Promise.all(
      fullUser.wishlist.map(async (bookId) => {
        try{
            const bookData = await getBookById(bookId.toString());
        return bookData
        }
        catch (error) {
          return null;
        }
      })
    );

    res.json(fullBooksOfWishlist.filter(Boolean));

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});


router.get("/readlist", async (req: Request, res: Response) => {
  try {
    const userId = req.authenticatedUser!._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const fullUser = await getFullUser(userId);
    if (!fullUser) {
      return res.status(404).json({ message: "User not found" });
    };

    const fullBooksOfReadlist = await Promise.all(
      fullUser.readlist.map(async (bookId) => {
        try{
            const bookData = await getBookById(bookId);
            return bookData
        }
        catch (error) {
          return null;
        }
      })
    );

    res.json(fullBooksOfReadlist.filter(Boolean));

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch readlist" });
  }
});


export default router;