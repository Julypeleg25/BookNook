import { UpdateUserSchema } from "../schemas/user.schema";
import z from "zod";

export type UpdateUserRequestDTO = z.infer<typeof UpdateUserSchema>;

export interface UserDto {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
}
