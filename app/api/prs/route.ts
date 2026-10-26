import { NextResponse } from "next/server";
import { fetchPRs, parseDateRange, parseRepo } from "@/lib/github";
import { rateLimitResponse } from "@/lib/guard";

export async function POST(req: Request) {
  const limited = rateLimitResponse(req.headers);
  if (limited) return limited;

  try {
    const { repo, since, until } = await req.json();
    const range = parseDateRange(since, until);
    return NextResponse.json({ prs: await fetchPRs(parseRepo(repo), range.since, range.until) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not fetch pull requests" },
      { status: 400 },
    );
  }
}
