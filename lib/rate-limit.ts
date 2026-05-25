/**
 * In-memory sliding window rate limiter (PRD §11.3).
 * Cocok untuk MVP single-instance; ganti dengan Redis untuk production.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
};

/**
 * Default limits per PRD §11.3
 */
export const RATE_LIMITS = {
  perApiKey: Number(process.env.RATE_LIMIT_PER_API_KEY ?? 60), // per minute
  perPhonePer10min: Number(process.env.RATE_LIMIT_PER_PHONE_PER_10MIN ?? 3),
  perIp: Number(process.env.RATE_LIMIT_PER_IP ?? 100), // per minute
} as const;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
      retryAfterSec: Math.ceil(windowMs / 1000),
    };
  }

  const retryAfterSec = Math.max(1, Math.ceil((b.resetAt - now) / 1000));

  if (b.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: b.resetAt, retryAfterSec };
  }

  b.count += 1;
  return {
    allowed: true,
    remaining: limit - b.count,
    resetAt: b.resetAt,
    retryAfterSec,
  };
}

// Periodic cleanup
if (typeof globalThis !== "undefined" && !(globalThis as { __rlCleanup?: boolean }).__rlCleanup) {
  (globalThis as { __rlCleanup?: boolean }).__rlCleanup = true;
  setInterval(
    () => {
      const now = Date.now();
      for (const [k, v] of buckets) {
        if (v.resetAt < now) buckets.delete(k);
      }
    },
    5 * 60 * 1000,
  );
}

// Pre-baked windows
const ONE_MINUTE = 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export function rateLimitApiKey(keyId: string): RateLimitResult {
  return rateLimit(`apikey:${keyId}`, RATE_LIMITS.perApiKey, ONE_MINUTE);
}

export function rateLimitPhone(phone: string, purpose: string): RateLimitResult {
  return rateLimit(
    `phone:${phone}:${purpose}`,
    RATE_LIMITS.perPhonePer10min,
    TEN_MINUTES,
  );
}

export function rateLimitIp(ip: string): RateLimitResult {
  return rateLimit(`ip:${ip}`, RATE_LIMITS.perIp, ONE_MINUTE);
}
