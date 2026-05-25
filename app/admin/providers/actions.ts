"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import type { ProviderType } from "@prisma/client";

export async function upsertProvider(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "sms") as ProviderType;
  const priority = Number(formData.get("priority") ?? 1);
  if (!name) return;

  const existing = await db.providerSetting.findUnique({ where: { name } });

  if (existing) {
    await db.providerSetting.update({
      where: { id: existing.id },
      data: { type, priority, isActive: true },
    });
  } else {
    await db.providerSetting.create({
      data: { name, type, priority, isActive: true },
    });
  }
  revalidatePath("/admin/providers");
}

export async function toggleProvider(formData: FormData) {
  await requireAdmin();
  const providerId = String(formData.get("providerId"));
  const p = await db.providerSetting.findUnique({ where: { id: providerId } });
  if (!p) return;
  await db.providerSetting.update({
    where: { id: providerId },
    data: { isActive: !p.isActive },
  });
  revalidatePath("/admin/providers");
}
