type Entry = { count: number; resetAt: number };
const hits = new Map<string, Entry>();
export function checkRateLimit(ip: string, now = Date.now(), limit = 10, windowMs = 60_000) { const current = hits.get(ip); if (!current || now >= current.resetAt) { hits.set(ip, { count: 1, resetAt: now + windowMs }); return { allowed: true, retryAfter: 0 }; } if (current.count >= limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }; current.count += 1; return { allowed: true, retryAfter: 0 }; }
export function clientIp(headers: Headers) { return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"; }
export function resetRateLimitForTests() { hits.clear(); }
