import { Router } from "express";
import { searchBooksHandler, getBookByIdHandler } from "@controllers/bookController";

const router = Router();

router.get("/", searchBooksHandler);
router.get("/:externalBookId", getBookByIdHandler);

export default router;
