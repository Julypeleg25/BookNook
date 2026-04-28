import { Request, Response, NextFunction } from "express";
import { updateUser } from "@services/userService";
import { ValidationError } from "@utils/errors";
import { isImageFile, deleteFile, deleteOldAvatar } from "@utils/fileUtils";
import { HttpStatusCode } from "axios";
import { sanitizeUser } from "@utils/userUtils";
import { UpdateUserRequestDTO } from "@shared/dtos/user.dto";

export const getCurrentUser = (req: Request, res: Response): void => {
  res.json(req.authenticatedUser);
};

export const updateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.authenticatedUser!.id;
    const { name, username } = req.body;
    const updateData: UpdateUserRequestDTO = {};

    if (name) updateData.name = name;
    if (username) updateData.username = username;

    if (req.file) {
      if (!isImageFile(req.file.originalname)) {
        await deleteFile(req.file.path);
        throw new ValidationError("Avatar must be an image file");
      }

      await deleteOldAvatar(req.authenticatedUser!.avatar);
      updateData.avatar = `/uploads/${req.file.filename}`;
    } else if ("avatar" in req.body && req.body.avatar === "") {
      await deleteOldAvatar(req.authenticatedUser!.avatar);
      updateData.avatar = "";
    }

    const updatedUser = await updateUser(userId, updateData);

    res.status(HttpStatusCode.Ok).json({
      message: "User updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    if (req.file) await deleteFile(req.file.path);
    next(error);
  }
};
