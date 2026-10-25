import { describe, expect, it } from "vitest";
import { parseRepo, parseSince } from "../lib/github";

describe("parseRepo", () => {
  it("accepts owner/repo and GitHub URLs", () => {
    expect(parseRepo("vercel/next.js")).toBe("vercel/next.js");
    expect(parseRepo("https://github.com/vercel/next.js.git")).toBe("vercel/next.js");
  });
  it("rejects anything else", () => {
    expect(() => parseRepo("not a repo")).toThrow();
    expect(() => parseRepo("a/b repo:c/d")).toThrow();
  });
});

describe("parseSince", () => {
  it("accepts a plain date", () => expect(parseSince("2026-10-01")).toBe("2026-10-01"));
  it("rejects search-qualifier injection and bad input", () => {
    expect(() => parseSince("2026-10-01 repo:owner/private")).toThrow();
    expect(() => parseSince("yesterday")).toThrow();
    expect(() => parseSince(undefined)).toThrow();
  });
});
