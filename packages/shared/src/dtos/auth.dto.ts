import z from "zod";
import { UserDto } from "./user.dto";
import { LoginSchema, RegisterSchema } from "../schemas/auth.schema";

export type LoginRequestDTO = z.infer<typeof LoginSchema>;
export type RegisterRequestDTO = z.infer<typeof RegisterSchema>;
export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
}
