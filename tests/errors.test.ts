import { describe, expect, it } from "vitest";
import { friendlyError } from "../lib/errors";
describe("friendlyError", () => {
  it("maps invalid keys", () => expect(friendlyError(new Error("invalid api key"), 401)).toMatch(/key was rejected/i));
  it("maps provider rate limits", () => expect(friendlyError(new Error("rate limit"), 429)).toMatch(/rate-limiting/i));
  it("maps quota failures", () => expect(friendlyError(new Error("quota exceeded"))).toMatch(/quota/i));
  it("maps missing models", () => expect(friendlyError(new Error("model not found"))).toMatch(/model was not found/i));
  it("maps missing repositories", () => expect(friendlyError(new Error("Repository not found"))).toMatch(/not found or is private/i));
  it("maps GitHub rate limits", () => expect(friendlyError(new Error("GitHub rate limit reached"), 429)).toMatch(/GitHub is rate-limiting/i));
});
