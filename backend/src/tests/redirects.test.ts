import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_AUTH_REDIRECT,
  buildRedirectTarget,
  normalizeRedirectTarget,
} from "../../../frontend/src/utils/redirects";

describe("redirect helpers", () => {
  it("builds a redirect target from pathname, search, and hash", () => {
    expect(
      buildRedirectTarget({
        pathname: "/posts/123",
        search: "?tab=comments",
        hash: "#new",
      })
    ).toBe("/posts/123?tab=comments#new");
  });

  it("accepts safe internal redirect targets", () => {
    expect(normalizeRedirectTarget("/lists")).toBe("/lists");
  });

  it("falls back for missing redirect targets", () => {
    expect(normalizeRedirectTarget(undefined)).toBe(DEFAULT_AUTH_REDIRECT);
  });

  it("falls back for unsafe redirect targets", () => {
    expect(normalizeRedirectTarget("https://malicious.example")).toBe(
      DEFAULT_AUTH_REDIRECT
    );
    expect(normalizeRedirectTarget("//malicious.example")).toBe(
      DEFAULT_AUTH_REDIRECT
    );
  });
});
