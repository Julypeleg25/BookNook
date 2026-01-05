import { Request, Response, NextFunction } from "express";
import { updateUser } from "@services/userService";
import { ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";
import { isImageFile, deleteFile, deleteOldAvatar } from "@utils/fileUtils";
import { UPLOADS_FOLDER } from "@config/multerConfig";
import { HttpStatusCode } from "axios";

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json({
      id: req.authenticatedUser!._id,
      name: req.authenticatedUser!.name,
      username: req.authenticatedUser!.username,
      avatar: req.authenticatedUser!.avatar,
    });
  } catch (error) {
    logger.error("Error getting current user:", error);
    next(error);
  }
}
export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.authenticatedUser!._id;
    const { name, username } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (username) updateData.username = username;

    if (req.file) {
      if (!isImageFile(req.file.originalname)) {
        throw new ValidationError("Avatar must be an image file");
      }

      deleteOldAvatar(req.authenticatedUser!.avatar);
      updateData.avatar = `/${UPLOADS_FOLDER}/${req.file.filename}`;
    }

    const updatedUser = await updateUser(userId, updateData);

    res
      .json({
        message: "User updated successfully",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          avatar: updatedUser.avatar,
          email: updatedUser.email,
        },
      })
      .status(HttpStatusCode.Ok);
  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    next(error);
  }
}
