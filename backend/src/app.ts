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
import ragRoutes from "@routes/ragRoutes";
import { ensureSchema } from "@services/ai/vectorRepository";
import path from "path";


const app = express();

const initApp = async () => {
  app.use(cookieParser());

  app.use(
    cors({
      origin: ENV.FRONTEND_URL,
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.use(express.json({ limit: "10mb" }));

  app.use("/auth", authRoutes);
  app.use("/api/books", booksRouter);
  app.use("/userReviews", userReviewsRouter);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/lists", authenticate, listRouter);
  app.use("/api/users", userRouter);
  app.use("/api/rag", ragRoutes);

  app.use("/uploads", express.static(UPLOADS_FOLDER));

  app.use(errorHandler);

  const __dirname = path.resolve();
  const publicPath = path.join(__dirname, "public");

  app.use(express.static(publicPath));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });


  app.get("/*any", (req, res) => {
    res.sendFile(path.resolve(publicPath, "index.html"));
  });

  try {
    await mongoose.connect(ENV.MONGODB_URL);
    logger.info("Connected to MongoDB");

    try {
      await ensureSchema();
      logger.info("pgvector schema verified");
    } catch (err) {
      logger.error("Failed to initialize pgvector:", err);
    }
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    throw err;
  }

  return app;
};

export default initApp;
