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
      return NextResponse.json(
        { error: "Missing or invalid configuration" },
        { status: 400 }
      );
    }

    const sanitizedPRs = sanitizePRs(prs);
    if (!sanitizedPRs || sanitizedPRs.length === 0) {
      return NextResponse.json(
        { error: "No valid PRs provided" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({
      repo,
      range,
      tone,
      prs: sanitizedPRs,
    });

    const result = await sendToProvider({
      provider,
      model,
      baseUrl,
      apiKey,
      prompt,
      maxTokens: MAX_OUTPUT_TOKENS,
    });

    if (!result) {
      return NextResponse.json(
        { error: configErrorMessage(provider) },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: result });
  } catch (err) {
    return NextResponse.json(
      { error: friendlyError(err) },
      { status: 500 }
    );
  }
}
