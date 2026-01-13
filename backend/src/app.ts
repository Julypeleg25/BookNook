import { ENV } from "@config/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import cors from "cors";
import authRoutes from "@routes/auth";
import listRouter from "@routes/list";
import User, { IUser } from "@models/User";
import swaggerUi from "swagger-ui-express";
import booksRouter from "@routes/books";
import userReviewsRouter from "@routes/userReview";
import userRouter from "@routes/user";
import { swaggerSpec } from "../swagger";
import { UPLOADS_FOLDER } from "@config/multerConfig";
import cookieParser from "cookie-parser";
import { authenticate } from "@middlewares/authMiddleware";
import { errorHandler } from "@middlewares/errorHandler";

const app = express();
const PORT = ENV.PORT;

app.use(cookieParser());

app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  })
);

mongoose
  .connect(ENV.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(
  session({
    secret: ENV.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);
app.use("/", authRoutes);
app.use("/api/books", authenticate, booksRouter);
app.use("/userReviews", authenticate, userReviewsRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/lists", authenticate, listRouter);
app.use("/api/users", userRouter);

app.use("/uploads", authenticate, express.static(UPLOADS_FOLDER));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
