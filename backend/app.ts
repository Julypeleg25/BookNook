import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import authRoutes from "./routes/auth";
import User from "./models/User";
import router from "./routes/auth";
import swaggerUi from 'swagger-ui-express';
import booksRouter from './routes/books';

import { swaggerSpec } from './swagger';
// Import strategies
import googleStrategy from "./services/googleStrategy";
import localLoginStrategy from "./services/localStrategy";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

passport.serializeUser(function(user, done) {
               done(null, user.id);
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

app.use('/api/books', booksRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
