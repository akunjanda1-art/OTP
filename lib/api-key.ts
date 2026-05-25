import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { db } from "./db";

const PREFIX = "otp_";

/**
 * Generate a new plaintext API key plus its hash. PRD §7.2 / §14.1.
 * Format: otp_<24chars>. Database stores only the SHA-256 hash + prefix sample.
 */
export function generateApiKey(): { plaintext: string; hash: string; prefix: string } {
  const random = randomBytes(24).toString("base64url");
  const plaintext = `${PREFIX}${random}`;
  const hash = sha256(plaintext);
  const prefix = plaintext.slice(0, 12); // shown in dashboard for identification
  return { plaintext, hash, prefix };
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Resolve an API key from a Bearer token. Returns the active key + client + wallet.
 */
export async function resolveApiKey(bearer: string | null | undefined) {
  if (!bearer) return null;
  const token = bearer.replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith(PREFIX)) return null;
  const hash = sha256(token);

  const key = await db.apiKey.findFirst({
    where: { keyHash: hash, isActive: true },
    include: {
      client: { include: { wallet: true, user: true } },
    },
  });
  if (!key) return null;
  if (key.expiresAt && key.expiresAt < new Date()) return null;
  if (key.client.status !== "active") return null;
  if (key.client.user.status === "suspended") return null;

  // Update last used (fire & forget)
  db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return key;
}
