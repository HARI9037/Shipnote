import { NextResponse } from "next/server"; import { fetchPRs, parseRepo } from "@/lib/github";
export async function POST(req: Request) { try { const { repo, since } = await req.json(); return NextResponse.json({ prs: await fetchPRs(parseRepo(repo), since) }); } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Could not fetch pull requests" }, { status: 400 }); } }
