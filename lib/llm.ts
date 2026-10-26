import { PROVIDERS, type LLMConfig, type ProviderId } from "@/lib/providers";
import { validateBaseUrl } from "@/lib/ssrf";

export const MAX_OUTPUT_TOKENS = 2000;

export type Messages = { system?: string; user: string };
export type RequestOptions = { stream: boolean; maxTokens: number };
export type BuiltRequest = { url: string; init: RequestInit };

const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

/** Errors from validateBaseUrl are safe to show to the user; everything else is mapped to a friendly message. */
export function configErrorMessage(error: unknown): string | null {
  return error instanceof Error && /base URL|HTTPS|Private|resolve|credentials/.test(error.message)
    ? error.message
    : null;
}

/** Returns the OpenAI-compatible base URL for a provider, validating it when the user supplied it. */
export async function resolveBaseUrl(provider: ProviderId, baseUrl: unknown): Promise<string> {
  if (provider === "custom") return validateBaseUrl(baseUrl);
  return PROVIDERS[provider].baseUrl ?? "";
}

/** Pure request builder: no network, no validation, easy to unit test. */
export function buildRequest(
  config: LLMConfig,
  base: string,
  messages: Messages,
  { stream, maxTokens }: RequestOptions,
): BuiltRequest {
  const { provider, apiKey, model } = config;
  const json = { "content-type": "application/json" };

  if (provider === "anthropic") {
    return {
      url: ANTHROPIC_URL,
      init: {
        method: "POST",
        redirect: "error",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", ...json },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          ...(stream ? { stream: true } : {}),
          ...(messages.system ? { system: messages.system } : {}),
          messages: [{ role: "user", content: messages.user }],
        }),
      },
    };
  }

  if (provider === "google") {
    const method = stream ? "streamGenerateContent?alt=sse" : "generateContent";
    return {
      url: `${GOOGLE_BASE}/models/${encodeURIComponent(model)}:${method}`,
      init: {
        method: "POST",
        redirect: "error",
        headers: { "x-goog-api-key": apiKey, ...json },
        body: JSON.stringify({
          ...(messages.system ? { systemInstruction: { parts: [{ text: messages.system }] } } : {}),
          contents: [{ role: "user", parts: [{ text: messages.user }] }],
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      },
    };
  }

  // OpenAI, OpenRouter and any OpenAI-compatible endpoint.
  // OpenAI's newer models reject `max_tokens` and require `max_completion_tokens`.
  const tokenField = provider === "openai" ? "max_completion_tokens" : "max_tokens";
  return {
    url: `${base}/chat/completions`,
    init: {
      method: "POST",
      redirect: "error",
      headers: { Authorization: `Bearer ${apiKey}`, ...json },
      body: JSON.stringify({
        model,
        [tokenField]: maxTokens,
        ...(stream ? { stream: true } : {}),
        messages: [
          ...(messages.system ? [{ role: "system", content: messages.system }] : []),
          { role: "user", content: messages.user },
        ],
      }),
    },
  };
}

export async function sendToProvider(config: LLMConfig, messages: Messages, options: RequestOptions) {
  const base = await resolveBaseUrl(config.provider, config.baseUrl);
  const { url, init } = buildRequest(config, base, messages, options);
  return fetch(url, init);
}
