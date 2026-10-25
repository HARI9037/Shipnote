import { describe, expect, it, vi } from "vitest";
vi.mock("node:dns/promises", () => ({ default: { lookup: vi.fn(async (host: string) => host === "internal.example" ? [{ address: "10.0.0.7", family: 4 }] : [{ address: "93.184.216.34", family: 4 }] ) } }));
import { validateBaseUrl } from "../lib/ssrf";
describe("ssrf", () => {
  it("rejects HTTP", async () => await expect(validateBaseUrl("http://example.com/v1", false)).rejects.toThrow("HTTPS"));
  it.each(["https://localhost/v1", "https://127.0.0.1/v1", "https://169.254.169.254/v1", "https://10.0.0.1/v1", "https://172.16.0.1/v1", "https://192.168.1.1/v1", "https://[::1]/v1", "https://[fc00::1]/v1"]) ("rejects private target %s", async (url) => await expect(validateBaseUrl(url, false)).rejects.toThrow("Private"));
  it("rejects a hostname resolving to a private address", async () => await expect(validateBaseUrl("https://internal.example/v1", false)).rejects.toThrow("Private"));
  it("permits private self-hosted endpoints only with the explicit override", async () => await expect(validateBaseUrl("http://127.0.0.1:11434/v1", true)).resolves.toBe("http://127.0.0.1:11434/v1"));
});
