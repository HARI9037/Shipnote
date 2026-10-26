import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export function rateLimitResponse(headers: Headers) {
  const limit = checkRateLimit(clientIp(headers));
  if (limit.allowed) return null;
  return NextResponse.json(
    { error: "Too many requests. Please wait a minute and try again." },
    { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
  );
}
