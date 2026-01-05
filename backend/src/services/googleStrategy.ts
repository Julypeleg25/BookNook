import { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { userRepository } from "../repositories/userRepository";
import { logger } from "../utils/logger";
import { ENV } from "@config/config";

// googleStrategy.ts
export default new GoogleStrategy(
  {
    clientID: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    callbackURL: ENV.GOOGLE_CALLBACK_URL,
    proxy: true,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) return done(new Error("No email found in Google profile"));

      // 1. First, check by providerId (Google ID)
      let user = await userRepository.findByProviderId(profile.id);

      // 2. If not found, check by email (in case they registered locally before)
      if (!user) {
        user = await userRepository.findByEmail(email);
        
        // 3. If found by email, link the Google ID to this account
        if (user) {
          user.provider = "google";
          user.providerId = profile.id;
          await user.save();
        }
      }

      // 4. If still no user, create a brand new one
      if (!user) {
        const baseUsername = email.split("@")[0].substring(0, 10);
        user = await userRepository.create({
          provider: "google",
          providerId: profile.id,
          username: `${baseUsername}${Math.floor(Math.random() * 1000)}`,
          email: email,
          name: profile.displayName,
          avatar: profile.photos?.[0].value,
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err as Error);
    }
  }
);