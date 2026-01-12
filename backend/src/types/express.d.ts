import { UserDto } from "@shared/index";
import { IUser } from "../models/User";

declare global {
  namespace Express {
    export interface Request {
      // user?: IUser;
      authenticatedUser: UserDto;
    }//todo
  }
}

export {};
