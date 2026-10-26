import { describe, expect, it } from "vitest";
import { buildRequest, configErrorMessage } from "../lib/llm";

const msgs = { system: "SYS", user: "USER" };
const body = (r: { init: RequestInit }) => JSON.parse(String(r.init.body));

describe("buildRequest", () => {
  it("builds an Anthropic streaming request", () => {
    const r = buildRequest({ provider: "anthropic", apiKey: "k", model: "m" }, "", msgs, {
      stream: true,
      maxTokens: 2000,
    });
    expect(r.url).toBe("https://api.anthropic.com/v1/messages");
    expect((r.init.headers as Record<string, string>)["x-api-key"]).toBe("k");
    expect(r.init.redirect).toBe("error");
    expect(body(r)).toMatchObject({ model: "m", max_tokens: 2000, stream: true, system: "SYS" });
  });

  it("omits stream and system when not needed", () => {
    const b = body(
      buildRequest(
        { provider: "anthropic", apiKey: "k", model: "m" },
        "",
        { user: "hi" },
        { stream: false, maxTokens: 16 },
      ),
    );
    expect(b.stream).toBeUndefined();
    expect(b.system).toBeUndefined();
  });

  it("uses the streaming or plain Google endpoint and encodes the model", () => {
    const cfg = { provider: "google", apiKey: "k", model: "gemini x/y" } as const;
    expect(buildRequest(cfg, "", msgs, { stream: true, maxTokens: 10 }).url).toContain(
      ":streamGenerateContent?alt=sse",
    );
    expect(buildRequest(cfg, "", msgs, { stream: false, maxTokens: 10 }).url).toMatch(/:generateContent$/);
    expect(buildRequest(cfg, "", msgs, { stream: false, maxTokens: 10 }).url).toContain("gemini%20x%2Fy");
  });

  it("keeps the Google key out of the URL", () => {
    const r = buildRequest({ provider: "google", apiKey: "SECRET", model: "m" }, "", msgs, {
      stream: true,
      maxTokens: 10,
    });
    expect(r.url).not.toContain("SECRET");
    expect((r.init.headers as Record<string, string>)["x-goog-api-key"]).toBe("SECRET");
  });

  it("uses max_completion_tokens for OpenAI and max_tokens for other compatible endpoints", () => {
    const openai = body(
      buildRequest({ provider: "openai", apiKey: "k", model: "m" }, "https://api.openai.com/v1", msgs, {
        stream: true,
        maxTokens: 2000,
      }),
    );
    expect(openai.max_completion_tokens).toBe(2000);
    expect(openai.max_tokens).toBeUndefined();
    const other = body(
      buildRequest(
        { provider: "openrouter", apiKey: "k", model: "m" },
        "https://openrouter.ai/api/v1",
        msgs,
        { stream: true, maxTokens: 2000 },
      ),
    );
    expect(other.max_tokens).toBe(2000);
    expect(other.max_completion_tokens).toBeUndefined();
  });

  it("sends the system message first for OpenAI-compatible providers and the key only in a header", () => {
    const r = buildRequest(
      { provider: "custom", apiKey: "SECRET", model: "m" },
      "https://example.com/v1",
      msgs,
      { stream: false, maxTokens: 16 },
    );
    expect(r.url).toBe("https://example.com/v1/chat/completions");
    expect(body(r).messages).toEqual([
      { role: "system", content: "SYS" },
      { role: "user", content: "USER" },
    ]);
    expect(r.url).not.toContain("SECRET");
    expect(String(r.init.body)).not.toContain("SECRET");
  });
});

describe("configErrorMessage", () => {
  it("passes through URL validation errors only", () => {
    expect(configErrorMessage(new Error("Private base URLs are not allowed"))).toBe(
      "Private base URLs are not allowed",
    );
    expect(configErrorMessage(new Error("Invalid API key sk-123"))).toBeNull();
    expect(configErrorMessage("nope")).toBeNull();
  });
});
