import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApi } from "@/lib/api-auth";
import { resendOtp } from "@/lib/otp-service";
import { ok, fail } from "@/lib/response";

const Schema = z.object({
  phone: z.string().min(8).max(20),
  channel: z.enum(["sms", "whatsapp", "email", "voice"]),
  purpose: z.string().min(1).max(50),
});

export async function POST(req: NextRequest) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return auth.response;

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Data tidak valid", {
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const result = await resendOtp({
    clientId: auth.key.clientId,
    apiKeyId: auth.key.id,
    phone: parsed.data.phone,
    purpose: parsed.data.purpose,
    channel: parsed.data.channel,
  });

  if (!result.ok) return fail(result.code, result.message, result.extra);
  return ok(
    { request_id: result.data.requestId, expired_in: result.data.expiresIn },
    "OTP resent",
  );
}
