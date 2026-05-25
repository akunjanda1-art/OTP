"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/api-key";

export async function createApiKey(formData: FormData) {
  const session = await requireClient();
  const name = String(formData.get("name") ?? "").trim() || "Untitled";

  const { plaintext, hash, prefix } = generateApiKey();
  await db.apiKey.create({
    data: {
      clientId: session.clientId!,
      name,
      keyPrefix: prefix,
      keyHash: hash,
      rateLimitPerMinute: 60,
    },
  });

  // Redirect with the plaintext in URL so we can display it once.
  // (Cookie/flash would be cleaner; URL keeps this self-contained for MVP.)
  redirect(
    `/dashboard/api-keys?created=${encodeURIComponent(plaintext)}&prefix=${encodeURIComponent(prefix)}`,
  );
}

export async function revokeApiKey(formData: FormData) {
  const session = await requireClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.apiKey.updateMany({
    where: { id, clientId: session.clientId! },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/api-keys");
}
