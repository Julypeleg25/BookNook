import express from "express";
import {
  addBookToList,
  getWishlist,
  getReadlist,
  removeBookFromList,
} from "@controllers/listController";

const router = express.Router();

router.post("/:bookId", addBookToList);
router.get("/wishlist", getWishlist);
router.get("/readlist", getReadlist);
router.delete("/:bookId", removeBookFromList);

export default router;
