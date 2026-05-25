import { NextRequest } from "next/server";
import { authenticateApi } from "@/lib/api-auth";
import { getOtpStatus } from "@/lib/otp-service";
import { ok, fail } from "@/lib/response";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ requestId: string }> },
) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return auth.response;

  const { requestId } = await ctx.params;
  const row = await getOtpStatus(auth.key.clientId, requestId);
  if (!row) return fail("OTP_NOT_FOUND", "OTP tidak ditemukan");

  return ok({
    request_id: row.requestId,
    phone: row.phoneNormalized,
    channel: row.channel,
    delivery_status: row.deliveryStatus,
    verification_status: row.status === "verified" ? "verified" : "pending",
    created_at: row.createdAt.toISOString(),
    expired_at: row.expiredAt.toISOString(),
  });
}
