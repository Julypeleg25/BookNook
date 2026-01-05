import { Request, Response, NextFunction } from "express";
import { updateUser } from "@services/userService";
import { ValidationError } from "@utils/errors";
import { logger } from "@utils/logger";
import { isImageFile, deleteFile } from "@utils/fileUtils";
import fs from "fs";
import path from "path";
import { UpdateUserSchema } from "@shared/types/user";

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json({
      id: req.authenticatedUser!._id,
      email: req.authenticatedUser!.email,
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

    const updateData: { name?: string; username?: string; avatar?: string } =
      {};

    if (name) updateData.name = name;
    if (username) updateData.username = username;

    if (req.file) {
      if (!isImageFile(req.file.originalname)) {
        deleteFile(req.file.path);
        throw new ValidationError("Avatar must be an image file");
      }

      const oldAvatar = req.authenticatedUser!.avatar;
      if (oldAvatar && oldAvatar.startsWith("/uploads/")) {
        const oldAvatarPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(oldAvatar)
        );
        if (fs.existsSync(oldAvatarPath)) {
          deleteFile(oldAvatarPath);
        }
      }

      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    // const { error } = updateUserSchema.validate(updateData);
    // if (error) {
    //   if (req.file) deleteFile(req.file.path);
    //   throw new ValidationError(
    //     error.details && error.details[0]
    //       ? error.details[0].message
    //       : "error at updating user"
    //   );
    // }

    const updatedUser = await updateUser(userId, updateData);

    res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    logger.error("Error updating user:", error);
    next(error);
  }
}
