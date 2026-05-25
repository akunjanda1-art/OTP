import { NextRequest } from "next/server";
import { authenticateApi } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { ok } from "@/lib/response";

export async function GET(req: NextRequest) {
  const auth = await authenticateApi(req);
  if (!auth.ok) return auth.response;

  const wallet = await db.wallet.findUnique({
    where: { clientId: auth.key.clientId },
  });

  return ok({
    sms: wallet?.smsCredit ?? 0,
    whatsapp: wallet?.whatsappCredit ?? 0,
    general: wallet?.generalCredit ?? 0,
  });
}
