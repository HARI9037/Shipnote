import { NextResponse } from "next/server";
import { friendlyError } from "@/lib/errors";
import { sanitizePRs } from "@/lib/github";
import { rateLimitResponse } from "@/lib/guard";
import { MAX_OUTPUT_TOKENS, configErrorMessage, sendToProvider } from "@/lib/llm";
import { buildPrompt } from "@/lib/prompt";
import { isProviderId } from "@/lib/providers";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req.headers);
  if (limited) return limited;

  try {
    const { provider, model, baseUrl, repo, range, tone, prs } = await req.json();
    const apiKey = req.headers.get("x-llm-key");
    if (
      !isProviderId(provider) ||
      !apiKey ||
      typeof model !== "string" ||
      !model ||
      typeof repo !== "string"
    ) {
      return NextResponse.json({ error: "Check your provider settings and repository." }, { status: 400 });
    }
    const selected = sanitizePRs(prs);
    if (!selected.length)
      return NextResponse.json({ error: "Select at least one pull request." }, { status: 400 });

    const prompt = buildPrompt(
      repo.slice(0, 200),
      typeof range === "string" ? range.slice(0, 100) : "selected dates",
      tone === "Technical" || tone === "Marketing" ? tone : "Friendly",
      selected,
    );
    const response = await sendToProvider(
      { provider, apiKey, model, baseUrl },
      { system: prompt.system, user: prompt.user },
      { stream: true, maxTokens: MAX_OUTPUT_TOKENS },
    );

    if (!response.ok || !response.body) {
      // The provider's message is only used to classify the failure, never returned to the client.
      const detail = await response.text().catch(() => "");
      return NextResponse.json(
        { error: friendlyError(new Error(detail.slice(0, 500)), response.status) },
        { status: 400 },
      );
    }
    return new Response(response.body, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache, no-transform",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    const message = configErrorMessage(error) ?? "Could not generate notes. Check your provider settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
