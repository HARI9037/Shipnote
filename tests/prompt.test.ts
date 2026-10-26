import { describe, expect, it } from "vitest";
import { buildPrompt } from "../lib/prompt";
describe("prompt", () =>
  it("contains tone and headings", () => {
    const p = buildPrompt("a/b", "14 days", "Friendly", []);
    expect(p.system).toContain("New, Improved, Fixed");
    expect(p.system).toContain("warm");
  }));
