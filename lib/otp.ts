import { createHash, randomInt, timingSafeEqual } from "crypto";

const OTP_LENGTH = Number(process.env.OTP_LENGTH ?? 6);

export function generateOtp(length = OTP_LENGTH): string {
  // numeric OTP, zero-padded
  const max = 10 ** length;
  const n = randomInt(0, max);
  return String(n).padStart(length, "0");
}

/**
 * Hash an OTP for storage. Uses SHA-256 with a static pepper
 * derived from SESSION_SECRET so leaked DB rows still cannot be brute forced
 * without the pepper. Note: also bound to client+purpose+phone via key derivation.
 */
export function hashOtp(otp: string, salt: string): string {
  const pepper = process.env.SESSION_SECRET ?? "dev-pepper";
  return createHash("sha256").update(`${pepper}:${salt}:${otp}`).digest("hex");
}

export function verifyOtpHash(otp: string, salt: string, hash: string): boolean {
  const candidate = hashOtp(otp, salt);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Generate a unique request id (otp_*).
 */
export function generateRequestId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `otp_${ts}${rand}`;
}
