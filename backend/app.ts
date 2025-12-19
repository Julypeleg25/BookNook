import express from "express";
import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import authRoutes from "./routes/auth";
import User from "./models/User";
import router from "./routes/auth";
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
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/oauth2/redirect/google", // Changed to HTTP
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        } else {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value,
            avatar: profile.photos?.[0].value,
          });
          await user.save();
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
