import { NextResponse } from "next/server";
import { friendlyError } from "@/lib/errors";
import { rateLimitResponse } from "@/lib/guard";
import { configErrorMessage, sendToProvider } from "@/lib/llm";
import { isProviderId } from "@/lib/providers";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req.headers);
  if (limited) return limited;

  try {
    const { provider, model, baseUrl } = await req.json();
    const apiKey = req.headers.get("x-llm-key");
    if (!isProviderId(provider) || !apiKey || typeof model !== "string" || !model) {
      return NextResponse.json({ error: "Enter an API key and a model name." }, { status: 400 });
    }
    const response = await sendToProvider(
      { provider, apiKey, model, baseUrl },
      { user: "Reply OK" },
      { stream: false, maxTokens: 16 },
    );
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return NextResponse.json(
        { error: friendlyError(new Error(detail.slice(0, 500)), response.status) },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = configErrorMessage(error) ?? friendlyError(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
