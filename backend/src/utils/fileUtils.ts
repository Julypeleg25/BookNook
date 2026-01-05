import path from "path";
import fs from "fs/promises";
import { logger } from "./logger";
import { UPLOADS_FOLDER } from "@config/multerConfig";

const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

export const isImageFile = (filename: string): boolean => {
  return validExtensions.includes(getFileExtension(filename));
};

export const generateUniqueFilename = (originalName: string): string => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${uniqueSuffix}${getFileExtension(originalName)}`;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  if (!filePath) return;

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  try {
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      logger.error(`Error deleting file at ${absolutePath}:`, error);
    }
  }
};

export const deleteOldAvatar = async (
  avatarUrl: string | undefined
): Promise<void> => {
  if (!avatarUrl || !avatarUrl.startsWith(`/${UPLOADS_FOLDER}/`)) return;

  const fileName = path.basename(avatarUrl);
  const fullPath = path.join(UPLOADS_FOLDER, fileName);

  await deleteFile(fullPath);
};
