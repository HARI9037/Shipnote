export type ProviderId = "anthropic" | "openai" | "google" | "openrouter" | "custom";
export type LLMConfig = { provider: ProviderId; apiKey: string; model: string; baseUrl?: string };

export const PROVIDERS: Record<ProviderId, { label: string; model: string; baseUrl?: string }> = {
  anthropic: { label: "Anthropic", model: "claude-haiku-5-5" },
  openai: { label: "OpenAI", model: "gpt-5-nano", baseUrl: "https://api.openai.com/v1" },
  google: { label: "Google", model: "gemini-3.5-flash-lite" },
  openrouter: { label: "OpenRouter", model: "", baseUrl: "https://openrouter.ai/api/v1" },
  custom: { label: "Custom OpenAI-compatible", model: "" },
};

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === "string" && value in PROVIDERS;
}
