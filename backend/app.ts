import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import authRoutes from "./src/routes/auth";
import listRouter  from "./src/routes/list";
import User, { IUser } from "./src/models/User";
import swaggerUi from "swagger-ui-express";
import booksRouter from "./src/routes/books";
import userReviewsRouter from "./src/routes/userReview";

import { swaggerSpec } from './swagger';
import { UPLOADS_FOLDER } from "./multerConfig";
// Import strategies
import googleStrategy from "./src/services/googleStrategy";
import localLoginStrategy from "./src/services/localStrategy";
import cookieParser from "cookie-parser";

import { requireAuth } from "./src/middlewares/authMiddleware";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/booknook")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(localLoginStrategy);
passport.use(googleStrategy);

passport.serializeUser(function (user, done) {
  const userObj = user as IUser;
  done(null, userObj._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use("/", authRoutes);

app.use("/api/books", requireAuth, booksRouter);
app.use("/userReviews", requireAuth, userReviewsRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/lists', requireAuth, listRouter);

// Serve uploaded images
app.use("/uploads", requireAuth, express.static(UPLOADS_FOLDER));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

