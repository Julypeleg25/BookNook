import { ENV } from "@config/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "@routes/auth";
import listRouter from "@routes/list";
import swaggerUi from "swagger-ui-express";
import booksRouter from "@routes/books";
import userReviewsRouter from "@routes/userReview";
import userRouter from "@routes/user";
import { swaggerSpec } from "../swagger";
import { UPLOADS_FOLDER } from "@config/multerConfig";
import cookieParser from "cookie-parser";
import { authenticate } from "@middlewares/authMiddleware";
import { errorHandler } from "@middlewares/errorHandler";
import { logger } from "@utils/logger";

const app = express();
const PORT = ENV.PORT;

app.use(cookieParser());

app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.use("/", authRoutes);
app.use("/api/books", authenticate, booksRouter);
app.use("/userReviews", authenticate, userReviewsRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/lists", authenticate, listRouter);
app.use("/api/users", userRouter);

// Uploads should be publicly accessible for img tags to work (since they don't send Bearer tokens)
// If privacy is required, a different strategy (signed URLs or blob fetching) is needed.
app.use("/uploads", express.static(UPLOADS_FOLDER));

app.use(errorHandler);

mongoose
  .connect(ENV.MONGODB_URL)
  .then(() => {
    logger.info("Connected to MongoDB");
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });
