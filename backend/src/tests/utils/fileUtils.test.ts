import fs from "fs/promises";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { UPLOADS_FOLDER } from "@config/multerConfig";
import { logger } from "../../utils/logger";
import {
  deleteFile,
  deleteOldAvatar,
  generateUniqueFilename,
  getFileExtension,
  isImageFile,
} from "../../utils/fileUtils";

describe("fileUtils", () => {
  const tempDir = path.join(process.cwd(), "tmp-test-uploads");

  beforeEach(async () => {
    jest.restoreAllMocks();
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("normalizes file extensions and detects supported image files", () => {
    expect(getFileExtension("Cover.JPG")).toBe(".jpg");
    expect(getFileExtension("archive.tar.gz")).toBe(".gz");
    expect(isImageFile("cover.WEBP")).toBe(true);
    expect(isImageFile("notes.txt")).toBe(false);
  });

  it("generates unique filenames while preserving lower-case extensions", () => {
    jest.spyOn(Date, "now").mockReturnValue(123456);
    jest.spyOn(Math, "random").mockReturnValue(0.987654321);

    expect(generateUniqueFilename("Cover.PNG")).toBe("123456-987654321.png");
  });

  it("deletes existing files by absolute path", async () => {
    const filePath = path.join(tempDir, "delete-me.txt");
    await fs.writeFile(filePath, "content");

    await deleteFile(filePath);

    await expect(fs.access(filePath)).rejects.toThrow();
  });

  it("ignores empty and missing file paths", async () => {
    const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});

    await expect(deleteFile("")).resolves.toBeUndefined();
    await expect(deleteFile(path.join(tempDir, "missing.txt"))).resolves.toBeUndefined();

    expect(loggerSpy).not.toHaveBeenCalled();
  });

  it("logs non-missing delete failures without throwing", async () => {
    const error = Object.assign(new Error("permission denied"), { code: "EACCES" });
    const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
    jest.spyOn(fs, "access").mockResolvedValue(undefined);
    jest.spyOn(fs, "unlink").mockRejectedValue(error);

    await expect(deleteFile(path.join(tempDir, "blocked.txt"))).resolves.toBeUndefined();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error deleting file"),
      error,
    );
  });

  it("deletes only upload-backed old avatars", async () => {
    const avatarPath = path.join(UPLOADS_FOLDER, "old-avatar.png");
    await fs.mkdir(UPLOADS_FOLDER, { recursive: true });
    await fs.writeFile(avatarPath, "avatar");

    await deleteOldAvatar("/uploads/old-avatar.png");
    await deleteOldAvatar("https://example.com/avatar.png");
    await deleteOldAvatar(undefined);

    await expect(fs.access(avatarPath)).rejects.toThrow();
  });
});
