import { Types } from "mongoose";
import { IUser } from "@models/User";
import { userRepository } from "@repositories/userRepository";
import { hashPassword } from "@utils/hashPassword";
import { NotFoundError, ConflictError, ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";
import { UpdateUserRequestDTO } from "@shared/dtos/user.dto";

interface CreateUserData {
  email: string;
  username: string;
  password?: string;
  provider: "local" | "google";
  providerId?: string;
  avatar?: string;
}

export async function getUserById(
  userId: Types.ObjectId | string
): Promise<IUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
}

export async function getUserByUsername(
  username: string
): Promise<IUser | null> {
  return await userRepository.findByUsername(username);
}

export async function getUserByProviderId(
  providerId: string
): Promise<IUser | null> {
  return await userRepository.findByProviderId(providerId);
}

export async function createUser(userData: CreateUserData): Promise<IUser> {
  const existingEmail = await userRepository.findByEmail(userData.email);
  if (existingEmail) {
    throw new ConflictError("Email already exists");
  }

  const existingUsername = await userRepository.findByUsername(userData.username);
  if (existingUsername) {
    throw new ConflictError("Username already exists");
  }

  const hashedPassword = userData.password
    ? await hashPassword(userData.password)
    : undefined;

  return await userRepository.create({
    ...userData,
    password: hashedPassword,
  });
}

export async function updateUser(
  userId: Types.ObjectId | string,
  updateData: UpdateUserRequestDTO
): Promise<IUser> {
  if (updateData.username) {
    const existingUser = await userRepository.findByUsername(updateData.username);
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      throw new ConflictError("Username already exists");
    }
  }

  const updatedUser = await userRepository.update(userId, updateData);
  if (!updatedUser) {
    throw new NotFoundError("User not found");
  }

  return updatedUser;
}

export async function updateUserTokens(
  userId: string,
  accessToken: string | null,
  refreshToken: string | null
): Promise<void> {
  await userRepository.updateTokens(userId, accessToken, refreshToken);
}
