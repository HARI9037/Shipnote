import { NextResponse } from "next/server";
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
      tone === "Technical" || tone
