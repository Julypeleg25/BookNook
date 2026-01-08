import { UpdateUserSchema } from "../schemas/user.schema";
import z from "zod";

export type UpdateUserRequestDTO = z.infer<typeof UpdateUserSchema>;

export interface UserDto {
  username: string;
  email: string;
  avatar: string;
  id: string;
}
