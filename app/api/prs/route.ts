import { NextResponse } from "next/server";
import { fetchPRs, parseRepo, parseSince } from "@/lib/github";
import { rateLimitResponse } from "@/lib/guard";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req.headers);
  if (limited) return limited;

  try {
    const { repo, since } = await req.json();
    return NextResponse.json({ prs: await fetchPRs(parseRepo(repo), parseSince(since)) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not fetch pull requests" },
      { status: 400 },
    );
  }
}
