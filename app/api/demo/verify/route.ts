import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp-service";
import { ok, fail } from "@/lib/response";

const Schema = z.object({
  phone: z.string().min(8).max(20),
  otp: z.string().min(4).max(10),
  purpose: z.string().default("demo"),
});

export async function POST(req: NextRequest) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Data tidak valid");
  }

  const demo = await db.user.findUnique({
    where: { email: "demo@otpgo.local" },
    include: { client: true },
  });
  if (!demo?.client) return fail("OTP_NOT_FOUND", "Demo client tidak ditemukan");

  const result = await verifyOtp({
    clientId: demo.client.id,
    phone: parsed.data.phone,
    purpose: parsed.data.purpose,
    otp: parsed.data.otp,
  });

  if (!result.ok) return fail(result.code, result.message, result.extra);
  return ok({ verified: true });
}
