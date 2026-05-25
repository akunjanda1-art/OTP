"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import type { ProductType, OtpChannel } from "@prisma/client";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function typeToChannel(t: ProductType): OtpChannel | null {
  if (t === "otp_sms") return "sms";
  if (t === "otp_whatsapp") return "whatsapp";
  return null;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "otp_sms") as ProductType;
  const creditAmount = Number(formData.get("creditAmount") ?? 0);
  const price = Number(formData.get("price") ?? 0);
  if (!name || price <= 0) return;

  const baseSlug = slugify(name) || `paket-${Date.now()}`;
  let slug = baseSlug;
  let i = 1;
  while (await db.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  await db.product.create({
    data: {
      name,
      slug,
      type,
      channel: typeToChannel(type),
      creditAmount,
      price,
      validityDays: 30,
      isActive: true,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/orders");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const p = await db.product.findUnique({ where: { id: productId } });
  if (!p) return;
  await db.product.update({
    where: { id: productId },
    data: { isActive: !p.isActive },
  });
  revalidatePath("/admin/products");
}
