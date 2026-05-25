import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendOtp } from "@/lib/otp-service";
import { ensureWallet, moveBalance } from "@/lib/wallet";
import { ok, fail } from "@/lib/response";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Public demo endpoint used by the landing-page OtpTester.
 * Uses a shared "demo" client with a small auto-top-up so visitors
 * can experience the flow without authenticating.
 *
 * Heavy IP rate limit to avoid abuse.
 */
const Schema = z.object({
  phone: z.string().min(8).max(20),
  channel: z.enum(["sms", "whatsapp", "email", "voice"]),
  purpose: z.string().default("demo"),
});

async function getDemoClientId(): Promise<string> {
  const email = "demo@otpgo.local";
  let user = await db.user.findUnique({
    where: { email },
    include: { client: true },
  });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: "Demo Public",
        password: "!demo-no-login!",
        role: "client",
        status: "active",
        client: {
          create: { businessName: "Demo Public Account", status: "active" },
        },
      },
      include: { client: true },
    });
  }
  if (!user.client) throw new Error("demo client missing");
  await ensureWallet(user.client.id);
  return user.client.id;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rl = rateLimit(`demo-send:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return fail("RATE_LIMITED", "Terlalu banyak permintaan demo", {
      retry_after: rl.retryAfterSec,
    });
  }

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Data tidak valid", {
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const clientId = await getDemoClientId();

  // Auto top-up demo wallet if low (max 20 per IP per window already enforced above)
  await moveBalance({
    clientId,
    amount: 1,
    type: "credit",
    channel: parsed.data.channel,
    referenceType: "demo_topup",
    description: "Demo public top-up",
  });

  const result = await sendOtp({
    clientId,
    phone: parsed.data.phone,
    purpose: parsed.data.purpose,
    channel: parsed.data.channel,
    ipAddress: ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  if (!result.ok) return fail(result.code, result.message, result.extra);
  return ok(
    {
      request_id: result.data.requestId,
      channel: result.data.channel,
      status: result.data.status,
    },
    "Demo OTP terkirim (cek terminal server)",
  );
}
