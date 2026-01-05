import { IUser } from "@models/User";

export interface AuthenticatedRequest extends Request {
  authenticatedUser?: IUser
}