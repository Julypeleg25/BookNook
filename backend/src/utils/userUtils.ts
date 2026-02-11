import { IUser } from "@models/User";
import { UserDto } from "@shared/dtos/user.dto";

export const generateUsernameFromEmail = (email: string): string => {
  const prefix = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNumber}`;
};

export const sanitizeUser = (user: IUser): UserDto => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  avatar: user.avatar,
});
