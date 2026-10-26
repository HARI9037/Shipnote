import { describe, expect, it, vi } from "vitest";
import { fetchPRs, parseDateRange, parseRepo, parseSince, sanitizePRs } from "../lib/github";

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

describe("sanitizePRs", () => {
  it("caps count and field sizes and drops malformed entries", () => {
    const many = Array.from({ length: 150 }, (_, i) => ({
      number: i,
      title: "x".repeat(500),
      body_excerpt: "y".repeat(900),
      labels: ["a", 5],
    }));
    const out = sanitizePRs([...many, { title: "no number" }, null]);
    expect(out).toHaveLength(100);
    expect(out[0].title).toHaveLength(300);
    expect(out[0].body_excerpt).toHaveLength(400);
    expect(out[0].labels).toEqual(["a"]);
  });
  it("returns an empty list for non-arrays", () => expect(sanitizePRs("x")).toEqual([]));
});

describe("parseDateRange", () => {
  it("accepts a start date alone or a start and end date", () => {
    expect(parseDateRange("2026-10-01")).toEqual({ since: "2026-10-01", until: undefined });
    expect(parseDateRange("2026-10-01", "2026-10-20")).toEqual({ since: "2026-10-01", until: "2026-10-20" });
    expect(parseDateRange("2026-10-01", "")).toEqual({ since: "2026-10-01", until: undefined });
  });
  it("rejects an end before the start, ranges over a year, and injection in the end date", () => {
    expect(() => parseDateRange("2026-10-20", "2026-10-01")).toThrow("end date");
    expect(() => parseDateRange("2024-01-01", "2026-10-01")).toThrow("one year");
    expect(() => parseDateRange("2026-10-01", "2026-10-02 repo:a/private")).toThrow();
  });
});

describe("fetchPRs query", () => {
  it("uses an open-ended qualifier without an end date and a bounded one with it", async () => {
    const calls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      calls.push(decodeURIComponent(url));
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    });
    await fetchPRs("a/b", "2026-10-01");
    await fetchPRs("a/b", "2026-10-01", "2026-10-20");
    vi.unstubAllGlobals();
    expect(calls[0]).toContain("merged:>=2026-10-01");
    expect(calls[1]).toContain("merged:2026-10-01..2026-10-20");
  });
});
