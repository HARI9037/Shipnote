import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitForTests } from "../lib/rate-limit";
afterEach(resetRateLimitForTests);
describe("rate limit", () => it("blocks the eleventh request inside one minute", () => { for (let index = 0; index < 10; index += 1) expect(checkRateLimit("203.0.113.1", 1000).allowed).toBe(true); const result = checkRateLimit("203.0.113.1", 1000); expect(result.allowed).toBe(false); expect(result.retryAfter).toBeGreaterThan(0); }));
