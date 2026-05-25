import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApi } from "@/lib/api-auth";
import { verifyOtp } from "@/lib/otp-service";
import { ok, fail } from "@/lib/response";

const Schema = z.object({
  phone: z.string().min(8).max(20),
  otp: z.string().min(4).max(10),
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

  const result = await verifyOtp({
    clientId: auth.key.clientId,
    phone: parsed.data.phone,
    purpose: parsed.data.purpose,
    otp: parsed.data.otp,
  });

  if (!result.ok) return fail(result.code, result.message, result.extra);

  return ok({
    verified: true,
    verified_at: result.data.verifiedAt.toISOString(),
    request_id: result.data.requestId,
  }, "OTP verified");
}
