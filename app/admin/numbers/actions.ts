"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";

export async function createNumber(formData: FormData) {
  await requireAdmin();
  const number = String(formData.get("number") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "ID").trim();
  const providerName = String(formData.get("providerName") ?? "").trim();
  const monthlyFee = Number(formData.get("monthlyFee") ?? 0);
  if (!number || !providerName) return;

  await db.dedicatedNumber.create({
    data: {
      number,
      countryCode,
      providerName,
      monthlyFee,
      status: "available",
    },
  });
  revalidatePath("/admin/numbers");
}

export async function assignNumber(formData: FormData) {
  await requireAdmin();
  const numberId = String(formData.get("numberId"));
  const clientId = String(formData.get("clientId") ?? "");
  await db.dedicatedNumber.update({
    where: { id: numberId },
    data: {
      clientId: clientId || null,
      status: clientId ? "assigned" : "available",
      assignedAt: clientId ? new Date() : null,
    },
  });
  revalidatePath("/admin/numbers");
}
