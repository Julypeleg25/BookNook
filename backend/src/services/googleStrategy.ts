import { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { userRepository } from "../repositories/userRepository";
import { logger } from "../utils/logger";
import { ENV } from "@config/config";

export default new GoogleStrategy(
  {
    clientID: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    callbackURL: ENV.GOOGLE_CALLBACK_URL,
    proxy: true,
  },
  async (
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) {
        return done(new Error("No email found in Google profile"));
      }

      let user = await userRepository.findByEmail(email);

      if (user) {
        return done(null, user);
      }

      const existingProviderUser = await userRepository.findByProviderId(profile.id);
      if (existingProviderUser) {
        return done(null, existingProviderUser);
      }

      const baseUsername = email.split("@")[0].substring(0, 10);
      const uniqueSuffix = Math.floor(Math.random() * 1000);
      
      const newUser = await userRepository.create({
        provider: "google",
        providerId: profile.id,
        username: `${baseUsername}${uniqueSuffix}`,
        email: email,
        avatar: profile.photos?.[0].value,
      });

      return done(null, newUser);
    } catch (err) {
      logger.error("Error in Google strategy:", err);
      return done(err as Error);
    }
  }
);