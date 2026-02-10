import { UserDto } from "@shared/dtos/user.dto";

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: UserDto;
    }
  }
}

export {};
