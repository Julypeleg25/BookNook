import { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { userRepository } from "@repositories/userRepository";
import { logger } from "@utils/logger";

export default new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    proxy: true,
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const email = profile.emails?.[0].value;
      if (!email) {
        return done(new Error("No email found in Google profile"));
      }

      const oldUser = await userRepository.findByEmail(email);
      if (oldUser) {
        return done(null, oldUser);
      }

      const existingProviderUser = await userRepository.findByProviderId(
        profile.id
      );
      if (existingProviderUser) {
        return done(null, existingProviderUser);
      }

      const newUser = await userRepository.create({
        provider: "google",
        providerId: profile.id,
        username: `user${profile.id}`,
        email: email,
        name: profile.displayName || undefined,
        avatar: profile.photos?.[0].value || undefined,
      });

      done(null, newUser);
    } catch (err) {
      logger.error("Error in Google strategy:", err);
      done(err as Error);
    }
  }
);
