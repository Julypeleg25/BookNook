import User, { IUser } from "@models/User";
import { Types } from "mongoose";
import { NotFoundError } from "@utils/errors";
import { logger } from "@utils/logger";

export class UserRepository {
  async findById(userId: Types.ObjectId | string): Promise<IUser | null> {
    try {
      return await User.findById(new Types.ObjectId(userId));
    } catch (error) {
      logger.error(`Error finding user by ID ${userId}:`, error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username: username.toLowerCase() });
    } catch (error) {
      logger.error(`Error finding user by username ${username}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  async findByProviderId(providerId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ providerId });
    } catch (error) {
      logger.error(`Error finding user by providerId ${providerId}:`, error);
      throw error;
    }
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);

      return await user.save();
    } catch (error: any) {
      logger.error("Error creating user:", error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`${field} already exists`);
      }
      throw error;
    }
  }

  async update(
    userId: Types.ObjectId | string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );
    } catch (error: any) {
      logger.error(`Error updating user ${userId}:`, error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`${field} already exists`);
      }
      throw error;
    }
  }

 

    async updateRefreshToken(
    userId: Types.ObjectId | string,
    refreshToken: string | null
  ): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {  refreshToken });
    } catch (error) {
      logger.error(`Error updating refreshToken for user ${userId}:`, error);
      throw error;
    }
  }

      async updateAccessToken(
    userId: Types.ObjectId | string,
    accessToken: string | null
  ): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {  accessToken });
    } catch (error) {
      logger.error(`Error updating accessToken for user ${userId}:`, error);
      throw error;
    }
  }

   async updateTokens(
    userId: Types.ObjectId | string,
    accessToken: string | null,
    refreshToken: string | null
  ): Promise<void> {
    try {
      await this.updateAccessToken(userId, accessToken)
      await this.updateRefreshToken(userId, refreshToken)
      
    } catch (error) {
      logger.error(`Error updating tokens for user ${userId}:`, error);
      throw error;
    }
  }

  async addBookToList(
    userId: Types.ObjectId | string,
    bookId: string,
    listType: "wish" | "read"
  ): Promise<string[]> {
    try {
      const field = listType === "wish" ? "wishlist" : "readlist";
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { [field]: bookId } },
        { new: true }
      );
      return updatedUser?.[field] || [];
    } catch (error) {
      logger.error(
        `Error adding book to ${listType}list for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  async getList(
    userId: Types.ObjectId | string,
    listType: "wish" | "read"
  ): Promise<string[]> {
    try {
      const user = await User.findById(userId);
      const field = listType === "wish" ? "wishlist" : "readlist";
      return user?.[field] || [];
    } catch (error) {
      logger.error(`Error getting ${listType}list for user ${userId}:`, error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
