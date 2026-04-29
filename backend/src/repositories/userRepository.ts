import User, { IUser } from "@models/User";
import { Types } from "mongoose";
import { logger } from "@utils/logger";
import { syncUserProfileToVector } from "@services/ai/vectorSyncService";


interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

export class UserRepository {
  async findById(userId: Types.ObjectId | string): Promise<IUser | null> {
    try {
      return await User.findById(new Types.ObjectId(String(userId)));
    } catch (error) {
      logger.error(`Error finding user by ID ${userId}:`, error);
      throw new Error(`Failed to find user by ID ${userId}`, { cause: error });
    }
  }

  async findByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username: username.toLowerCase() });
    } catch (error) {
      logger.error(`Error finding user by username ${username}:`, error);
      throw new Error(`Failed to find user by username ${username}`, { cause: error });
    }
  }

  async findByUsernamePartial(username: string): Promise<IUser[]> {
    try {
      return await User.find({ username: { $regex: username, $options: "i" } });
    } catch (error) {
      logger.error(`Error finding users by partial username ${username}:`, error);
      throw new Error(`Failed to find users by partial username ${username}`, { cause: error });
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw new Error(`Failed to find user by email ${email}`, { cause: error });
    }
  }

  async findByProviderId(providerId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ providerId });
    } catch (error) {
      logger.error(`Error finding user by providerId ${providerId}:`, error);
      throw new Error(`Failed to find user by providerId ${providerId}`, { cause: error });
    }
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      // await syncUserProfileToVector(savedUser);
      return savedUser;
    } catch (error: unknown) {
      logger.error("Error creating user:", error);

      const mongoError = error as MongoError;
      if (mongoError.code === 11000 && mongoError.keyPattern) {
        const field = Object.keys(mongoError.keyPattern)[0];
        throw new Error(`${field} already exists`, { cause: error });
      }
      throw new Error("Failed to create user", { cause: error });
    }
  }

  async update(
    userId: Types.ObjectId | string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        await syncUserProfileToVector(updatedUser);
      }
      return updatedUser;
    } catch (error: unknown) {
      logger.error(`Error updating user ${userId}:`, error);

      const mongoError = error as MongoError;
      if (mongoError.code === 11000 && mongoError.keyPattern) {
        const field = Object.keys(mongoError.keyPattern)[0];
        throw new Error(`${field} already exists`, { cause: error });
      }
      throw new Error(`Failed to update user ${userId}`, { cause: error });
    }
  }

  async updateTokens(
    userId: Types.ObjectId | string,
    accessToken: string | null,
    refreshToken: string | null
  ): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { accessToken, refreshToken });
    } catch (error) {
      logger.error(`Error updating tokens for user ${userId}:`, error);
      throw error;
    }
  }

  async addBookToWishlist(
    userId: Types.ObjectId | string,
    bookId: string,
  ): Promise<string[]> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: bookId } },
        { new: true }
      );
      if (updatedUser) {
        await syncUserProfileToVector(updatedUser);
      }
      return updatedUser?.wishlist ?? [];
    } catch (error) {
      logger.error(
        `Error adding book to wishlist for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  async getWishlist(
    userId: Types.ObjectId | string,
  ): Promise<string[]> {
    try {
      const user = await User.findById(userId);
      return user?.wishlist ?? [];
    } catch (error) {
      logger.error(`Error getting wishlist for user ${userId}:`, error);
      throw error;
    }
  }

  async removeBookFromWishlist(
    userId: Types.ObjectId | string,
    bookId: string | string[],
  ): Promise<string[]> {
    try {
      const bookIds = Array.isArray(bookId) ? bookId : [bookId];
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: { $in: bookIds } } },
        { new: true }
      );
      if (updatedUser) {
        await syncUserProfileToVector(updatedUser);
      }
      return updatedUser?.wishlist ?? [];
    } catch (error) {
      logger.error(
        `Error removing book from wishlist for user ${userId}:`,
        error
      );
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
