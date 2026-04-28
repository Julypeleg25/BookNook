import jwt from "jsonwebtoken";
import { Response } from "express";
import { jest } from "@jest/globals";
import { IUser } from "../models/User";
import { ENV } from "../config/config";
import { logger } from "../utils/logger";
import * as authService from "../services/authService";

describe("AuthService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("generateTokens", () => {
    it("returns an access token and a refresh token for the user", () => {
      const mockUser = { _id: "user123" } as unknown as IUser;

      const signSpy = jest
        .spyOn(jwt, "sign")
        .mockImplementation(() => "mock-token" as any);

      const tokens = authService.generateTokens(mockUser);

      expect(tokens).toEqual({
        accessToken: "mock-token",
        refreshToken: "mock-token",
      });
      expect(signSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("setAuthCookies", () => {
    it("stores the refresh token in an HTTP-only cookie", () => {
      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      authService.setAuthCookies(mockRes, "refresh-token");

      expect(mockRes.cookie).toHaveBeenCalledWith(
        expect.any(String),
        "refresh-token",
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe("verifyRefreshToken", () => {
    it("returns the decoded payload for a valid refresh token", () => {
      const mockPayload = { _id: "user123" } as any;

      const verifySpy = jest.spyOn(jwt, "verify").mockReturnValue(mockPayload);

      const decoded = authService.verifyRefreshToken("valid-token");

      expect(decoded).toEqual(mockPayload);
      expect(verifySpy).toHaveBeenCalledWith("valid-token", ENV.JWT_REFRESH_SECRET);
    });

    it("throws an unauthorized error and logs when the refresh token is invalid", () => {
      const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("invalid");
      });

      expect(() => authService.verifyRefreshToken("invalid-token")).toThrow(
        "Invalid refresh token",
      );
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
