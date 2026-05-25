import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApi } from "@/lib/api-auth";
import { sendOtp } from "@/lib/otp-service";
import { ok, fail } from "@/lib/response";

const Schema = z.object({
  phone: z.string().min(8).max(20),
  channel: z.enum(["sms", "whatsapp", "email", "voice"]),
  purpose: z.string().min(1).max(50),
  callback_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VALIDATION_ERROR", "Body harus JSON valid");
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Data tidak valid", {
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const result = await sendOtp({
    clientId: auth.key.clientId,
    apiKeyId: auth.key.id,
    phone: parsed.data.phone,
    channel: parsed.data.channel,
    purpose: parsed.data.purpose,
    callbackUrl: parsed.data.callback_url,
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  if (!result.ok) return fail(result.code, result.message, result.extra);

  return ok({
    request_id: result.data.requestId,
    phone: result.data.phone,
    channel: result.data.channel,
    status: result.data.status,
    expired_in: result.data.expiresIn,
  }, "OTP request accepted");
}
