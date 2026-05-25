import "server-only";
import { NextRequest } from "next/server";
import { resolveApiKey } from "./api-key";
import { rateLimit, RATE_LIMITS } from "./rate-limit";
import { fail } from "./response";

/**
 * Authenticate an API request (PRD §8.1 + §11.3).
 * Returns either:
 *   - { ok: true, key } when the API key is valid + client active + rate limit OK
 *   - { ok: false, response } where response is a NextResponse to return immediately
 */
export async function authenticateApi(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const key = await resolveApiKey(auth);

  if (!key) {
    return { ok: false as const, response: fail("INVALID_API_KEY", "API key tidak valid") };
  }

  if (key.client.status === "suspended") {
    return {
      ok: false as const,
      response: fail("CLIENT_SUSPENDED", "Client di-suspend"),
    };
  }

  // Per-key rate limit
  const rl = rateLimit(
    `apikey:${key.id}`,
    key.rateLimitPerMinute || RATE_LIMITS.perApiKey,
    60 * 1000,
  );
  if (!rl.allowed) {
    return {
      ok: false as const,
      response: fail("RATE_LIMITED", "Too many requests", { retry_after: rl.retryAfterSec }),
    };
  }

  return { ok: true as const, key };
}
