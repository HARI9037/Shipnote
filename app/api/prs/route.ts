import { NextResponse } from "next/server";
import { fetchPRs, parseRepo, parseSince } from "@/lib/github";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = checkRateLimit(clientIp(req.headers));
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  try {
    const { repo, since } = await req.json();
    return NextResponse.json({ prs: await fetchPRs(parseRepo(repo), parseSince(since)) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not fetch pull requests" }, { status: 400 });
  }
}
