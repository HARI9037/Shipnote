import { describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  default: {
    lookup: vi.fn(async (host: string) => {
      if (host === "internal.example") return [{ address: "10.0.0.7", family: 4 }];
      if (host === "mapped.example") return [{ address: "::ffff:127.0.0.1", family: 6 }];
      if (host === "missing.example") throw Object.assign(new Error("not found"), { code: "ENOTFOUND" });
      return [{ address: "93.184.216.34", family: 4 }];
    }),
  },
}));

import { privateAddress, validateBaseUrl } from "../lib/ssrf";

describe("validateBaseUrl", () => {
  it("rejects HTTP", async () => {
    await expect(validateBaseUrl("http://example.com/v1", false)).rejects.toThrow("HTTPS");
  });

  it.each([
    "https://localhost/v1",
    "https://api.localhost/v1",
    "https://127.0.0.1/v1",
    "https://0x7f000001/v1",
    "https://2130706433/v1",
    "https://169.254.169.254/v1",
    "https://10.0.0.1/v1",
    "https://172.16.0.1/v1",
    "https://192.168.1.1/v1",
    "https://100.64.0.1/v1",
    "https://[::1]/v1",
    "https://[fc00::1]/v1",
    "https://[fe80::1]/v1",
    "https://[::ffff:127.0.0.1]/v1",
    "https://[::ffff:10.0.0.1]/v1",
  ])("rejects private target %s", async (url) => {
    await expect(validateBaseUrl(url, false)).rejects.toThrow("Private");
  });

  it("rejects a hostname resolving to a private address", async () => {
    await expect(validateBaseUrl("https://internal.example/v1", false)).rejects.toThrow("Private");
  });

  it("rejects a hostname resolving to an IPv4-mapped loopback address", async () => {
    await expect(validateBaseUrl("https://mapped.example/v1", false)).rejects.toThrow("Private");
  });

  it("rejects unresolvable hosts with a clear message", async () => {
    await expect(validateBaseUrl("https://missing.example/v1", false)).rejects.toThrow("resolve");
  });

  it("rejects credentials in the URL", async () => {
    await expect(validateBaseUrl("https://user:pass@example.com/v1", false)).rejects.toThrow("credentials");
  });

  it("rejects non-http schemes", async () => {
    await expect(validateBaseUrl("file:///etc/passwd", true)).rejects.toThrow();
  });

  it("accepts a public HTTPS URL and trims the trailing slash", async () => {
    await expect(validateBaseUrl("https://example.com/v1/", false)).resolves.toBe("https://example.com/v1");
  });

  it("permits private self-hosted endpoints only with the explicit override", async () => {
    await expect(validateBaseUrl("http://127.0.0.1:11434/v1", true)).resolves.toBe(
      "http://127.0.0.1:11434/v1",
    );
  });
});

describe("privateAddress", () => {
  it.each([
    "0.0.0.0",
    "127.0.0.1",
    "10.1.2.3",
    "172.31.255.255",
    "192.168.0.1",
    "169.254.1.1",
    "100.127.0.1",
    "::1",
    "::",
    "fd12::1",
  ])("treats %s as private", (ip) => expect(privateAddress(ip)).toBe(true));
  it.each(["8.8.8.8", "93.184.216.34", "172.32.0.1", "100.63.0.1", "2606:4700::1111"])(
    "treats %s as public",
    (ip) => expect(privateAddress(ip)).toBe(false),
  );
});
