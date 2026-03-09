import { ENV } from "@config/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import https from "https";
import fs from "fs";
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
import { fileURLToPath } from "url";
import path from "path";


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

app.use("/auth", authRoutes);
app.use("/api/books", authenticate, booksRouter);
app.use("/userReviews", authenticate, userReviewsRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/lists", authenticate, listRouter);
app.use("/api/users", userRouter);
app.use("/api/rag", ragRoutes);

app.use("/uploads", express.static(UPLOADS_FOLDER));

app.use(errorHandler);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicPath = path.resolve(process.cwd(), "public");
app.use(express.static(publicPath));

app.get("*", (req, res, next) => {
  // If it's an API route, don't serve index.html
  if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/userReviews")) {
    return next();
  }
  res.sendFile(path.join(publicPath, "index.html"));
});

mongoose
  .connect(ENV.MONGODB_URL)
  .then(async () => {
    logger.info("Connected to MongoDB");

    try {
      await ensureSchema();
      logger.info("pgvector schema verified");
    } catch (err) {
      logger.error("Failed to initialize pgvector:", err);
    }

    if (process.env.NODE_ENV === "production") {
      logger.info("Starting production server...");

      // HTTP server
      http.createServer(app).listen(PORT, () => {
        logger.info(`HTTP Server running on port ${PORT}`);
      });

      // HTTPS server
      try {
        const options = {
          key: fs.readFileSync(path.resolve(process.cwd(), "client-key.pem")),
          cert: fs.readFileSync(path.resolve(process.cwd(), "client-cert.pem")),
        };
        const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
        https.createServer(options, app).listen(HTTPS_PORT, () => {
          logger.info(`HTTPS Server running on port ${HTTPS_PORT}`);
        });
      } catch (err) {
        logger.warn("HTTPS certificates not found or invalid in CWD, HTTPS server not started.");
      }
    } else {
      app.listen(PORT, () => {
        logger.info(`Development server is running on http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });
