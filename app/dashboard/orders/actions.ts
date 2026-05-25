"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";

function generateOrderNumber() {
  const d = new Date();
  const ts =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `INV-${ts}-${rand}`;
}

export async function createOrder(formData: FormData) {
  const session = await requireClient();
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return;

  await db.order.create({
    data: {
      clientId: session.clientId!,
      orderNumber: generateOrderNumber(),
      status: "pending",
      subtotal: product.price,
      total: product.price,
      paymentMethod: "manual_transfer",
      items: {
        create: [
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            creditAmount: product.creditAmount,
          },
        ],
      },
    },
  });

  revalidatePath("/dashboard/orders");
}
