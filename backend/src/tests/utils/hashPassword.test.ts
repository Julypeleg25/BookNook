import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { SALT_ROUNDS } from "@config/constants";
import { comparePassword, hashPassword } from "../../utils/hashPassword";

describe("hashPassword utils", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("hashes passwords using configured salt rounds", async () => {
    const hashSpy = jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed" as never);

    await expect(hashPassword("secret")).resolves.toBe("hashed");
    expect(hashSpy as jest.Mock).toHaveBeenCalledWith("secret", SALT_ROUNDS);
  });

  it("compares plain and hashed passwords", async () => {
    const compareSpy = jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    await expect(comparePassword("secret", "hashed")).resolves.toBe(true);
    expect(compareSpy as jest.Mock).toHaveBeenCalledWith("secret", "hashed");
  });
});
