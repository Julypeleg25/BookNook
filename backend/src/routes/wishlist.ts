import express from "express";
import {
  addBookToWishlist,
  getWishlist,
  removeBookFromWishlist,
} from "@controllers/wishlistController";
import { authenticate } from "@middlewares/authMiddleware";

const router = express.Router();

router.post("/:bookId", authenticate, addBookToWishlist);
router.delete("/:bookId", authenticate, removeBookFromWishlist);

router.get("/", authenticate, getWishlist);

export default router;
