import { Types } from "mongoose";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockFindById = jest.fn() as any;
const mockFindByUsername = jest.fn() as any;
const mockFindByEmail = jest.fn() as any;
const mockFindByProviderId = jest.fn() as any;
const mockCreate = jest.fn() as any;
const mockUpdate = jest.fn() as any;
const mockUpdateTokens = jest.fn() as any;
const mockHashPassword = jest.fn() as any;

jest.unstable_mockModule("@repositories/userRepository", () => ({
  userRepository: {
    findById: mockFindById,
    findByUsername: mockFindByUsername,
    findByEmail: mockFindByEmail,
    findByProviderId: mockFindByProviderId,
    create: mockCreate,
    update: mockUpdate,
    updateTokens: mockUpdateTokens,
  },
}));

jest.unstable_mockModule("@utils/hashPassword", () => ({
  hashPassword: mockHashPassword,
}));

const userService = await import("../../services/userService");

describe("userService", () => {
  const userId = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("returns the user when found", async () => {
      const user = { _id: userId, username: "reader" };
      mockFindById.mockResolvedValue(user);

      await expect(userService.getUserById(userId)).resolves.toBe(user);
      expect(mockFindById).toHaveBeenCalledWith(userId);
    });

    it("throws when the user is missing", async () => {
      mockFindById.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow("User not found");
    });
  });

  describe("lookup helpers", () => {
    it("delegates username, email, and provider lookups to the repository", async () => {
      mockFindByUsername.mockResolvedValue({ username: "reader" });
      mockFindByEmail.mockResolvedValue({ email: "reader@example.com" });
      mockFindByProviderId.mockResolvedValue({ providerId: "google-id" });

      await expect(userService.getUserByUsername("reader")).resolves.toEqual({
        username: "reader",
      });
      await expect(userService.getUserByEmail("reader@example.com")).resolves.toEqual({
        email: "reader@example.com",
      });
      await expect(userService.getUserByProviderId("google-id")).resolves.toEqual({
        providerId: "google-id",
      });
    });
  });

  describe("createUser", () => {
    it("normalizes local users, hashes the password, and creates the user", async () => {
      const createdUser = { _id: userId, username: "reader" };
      mockFindByEmail.mockResolvedValue(null);
      mockFindByUsername.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue("hashed-password");
      mockCreate.mockResolvedValue(createdUser);

      const result = await userService.createUser({
        email: " Reader@Example.COM ",
        username: " Reader ",
        password: "abc123",
        provider: "local",
      });

      expect(result).toBe(createdUser);
      expect(mockFindByEmail).toHaveBeenCalledWith("reader@example.com");
      expect(mockFindByUsername).toHaveBeenCalledWith("reader");
      expect(mockHashPassword).toHaveBeenCalledWith("abc123");
      expect(mockCreate).toHaveBeenCalledWith({
        email: "reader@example.com",
        username: "reader",
        password: "hashed-password",
        provider: "local",
      });
    });

    it("creates provider users without hashing a missing password", async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockFindByUsername.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ _id: userId });

      await userService.createUser({
        email: "reader@example.com",
        username: "reader",
        provider: "google",
        providerId: "google-id",
        avatar: "/avatar.png",
      });

      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalledWith({
        email: "reader@example.com",
        username: "reader",
        provider: "google",
        providerId: "google-id",
        avatar: "/avatar.png",
        password: undefined,
      });
    });

    it("rejects duplicate emails before checking username or hashing password", async () => {
      mockFindByEmail.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(
        userService.createUser({
          email: "reader@example.com",
          username: "reader",
          password: "abc123",
          provider: "local",
        }),
      ).rejects.toThrow("Email already exists");

      expect(mockFindByUsername).not.toHaveBeenCalled();
      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("rejects duplicate usernames before hashing password", async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockFindByUsername.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(
        userService.createUser({
          email: "reader@example.com",
          username: "reader",
          password: "abc123",
          provider: "local",
        }),
      ).rejects.toThrow("Username already exists");

      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("normalizes username updates and persists the result", async () => {
      const updatedUser = { _id: userId, username: "newname" };
      mockFindByUsername.mockResolvedValue(null);
      mockUpdate.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, { username: " NewName " });

      expect(result).toBe(updatedUser);
      expect(mockFindByUsername).toHaveBeenCalledWith("newname");
      expect(mockUpdate).toHaveBeenCalledWith(userId, { username: "newname" });
    });

    it("allows keeping the same username for the same user", async () => {
      const updatedUser = { _id: userId, username: "reader" };
      mockFindByUsername.mockResolvedValue({ _id: userId });
      mockUpdate.mockResolvedValue(updatedUser);

      await expect(userService.updateUser(userId, { username: "reader" })).resolves.toBe(
        updatedUser,
      );
    });

    it("rejects username updates that belong to another user", async () => {
      mockFindByUsername.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(userService.updateUser(userId, { username: "taken" })).rejects.toThrow(
        "Username already exists",
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("throws when the user update does not find a user", async () => {
      mockUpdate.mockResolvedValue(null);

      await expect(userService.updateUser(userId, { name: "Reader" })).rejects.toThrow(
        "User not found",
      );
    });
  });

  it("updates persisted access and refresh tokens", async () => {
    mockUpdateTokens.mockResolvedValue(undefined);

    await userService.updateUserTokens(userId.toString(), "access", "refresh");

    expect(mockUpdateTokens).toHaveBeenCalledWith(userId.toString(), "access", "refresh");
  });
});
