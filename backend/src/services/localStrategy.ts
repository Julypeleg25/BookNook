import passport from "passport";
import { Strategy as PassportLocalStrategy } from "passport-local";
import { userRepository } from "../repositories/userRepository";
import { comparePassword } from "../utils/password";
import { loginSchema } from "../utils/validation";
import { logger } from "../utils/logger";

export default new PassportLocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
    session: false,
    passReqToCallback: true,
  },
  async (req, username, password, done) => {
    const { error } = loginSchema.validate(req.body);
    if (error && error.details && error.details[0]) {
      return done(null, false, { message: error.details[0].message });
    }

    try {
      const user = await userRepository.findByUsername(username.trim());
      if (!user) {
        return done(null, false, { message: "Username does not exist." });
      }
      if (!user.password) {
        return done(null, false, { message: "Username does not exist." });
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (err) {
      logger.error("Error in local strategy:", err);
      return done(err);
    }
  }
);
