"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";

export async function toggleClientStatus(formData: FormData) {
  await requireAdmin();
  const clientId = String(formData.get("clientId"));
  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) return;
  const next = client.status === "active" ? "suspended" : "active";
  await db.client.update({ where: { id: clientId }, data: { status: next } });
  revalidatePath("/admin/clients");
}
