import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { generateUsernameFromEmail, sanitizeUser } from "../../utils/userUtils";

describe("userUtils", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("generates a username from the email prefix and a four-digit suffix", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);

    expect(generateUsernameFromEmail("reader.name+tag@example.com")).toBe("readernametag1000");
  });

  it("preserves underscores and numbers when generating usernames", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.9999);

    expect(generateUsernameFromEmail("reader_123@example.com")).toBe("reader_1239999");
  });

  it("sanitizes users to the public DTO shape", () => {
    expect(
      sanitizeUser({
        _id: "user-id",
        username: "reader",
        email: "reader@example.com",
        avatar: "/avatar.png",
        password: "secret",
      } as never),
    ).toEqual({
      id: "user-id",
      username: "reader",
      email: "reader@example.com",
      avatar: "/avatar.png",
    });
  });
});
