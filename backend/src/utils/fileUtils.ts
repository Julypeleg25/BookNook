import path from "path";
import fs from "fs";
import { logger } from "./logger";

export function getFileExtension(filename: string): string {
  return path.extname(filename);
}

export function generateUniqueFilename(originalName: string): string {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = getFileExtension(originalName);
  return `${uniqueSuffix}${ext}`;
}

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
  }
}

export function isImageFile(filename: string): boolean {
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = getFileExtension(filename).toLowerCase();
  return validExtensions.includes(ext);
}

