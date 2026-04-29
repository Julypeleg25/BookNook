import jwt from "jsonwebtoken";
import { Response } from "express";
import { jest } from "@jest/globals";
import { IUser } from "../../models/User";
import { ENV } from "../../config/config";
import { logger } from "../../utils/logger";
import * as authService from "../../services/authService";

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

    it("logs and rethrows token generation failures", () => {
      const mockUser = { _id: "user123" } as unknown as IUser;
      const error = new Error("sign failed");
      const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
      jest.spyOn(jwt, "sign").mockImplementation(() => {
        throw error;
      });

      expect(() => authService.generateTokens(mockUser)).toThrow(error);
      expect(loggerSpy).toHaveBeenCalledWith("Error generating tokens:", error);
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

  describe("clearAuthCookies", () => {
    it("clears access and refresh cookies from the root path", () => {
      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      authService.clearAuthCookies(mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(expect.any(String), {
        path: "/",
      });
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

    it("throws an unauthorized error for string refresh payloads without logging", () => {
      const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
      jest.spyOn(jwt, "verify").mockReturnValue("bad-payload" as any);

      expect(() => authService.verifyRefreshToken("invalid-token")).toThrow(
        "Invalid refresh token payload",
      );
      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });

  describe("verifyAccessToken", () => {
    it("returns the decoded payload for a valid access token", () => {
      const mockPayload = { _id: "user123" } as any;

      const verifySpy = jest.spyOn(jwt, "verify").mockReturnValue(mockPayload);

      expect(authService.verifyAccessToken("valid-token")).toEqual(mockPayload);
      expect(verifySpy).toHaveBeenCalledWith("valid-token", ENV.JWT_ACCESS_SECRET);
    });

    it("throws an unauthorized error and logs when the access token is invalid", () => {
      const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("invalid");
      });

      expect(() => authService.verifyAccessToken("invalid-token")).toThrow(
        "Invalid access token",
      );
      expect(loggerSpy).toHaveBeenCalled();
    });

    it("does not log expired access tokens as unexpected errors", () => {
      const loggerSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new jwt.TokenExpiredError("expired", new Date());
      });

      expect(() => authService.verifyAccessToken("expired-token")).toThrow(
        "Invalid access token",
      );
      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });
});
