"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { creditWallet, type ChannelKey } from "@/lib/wallet";
import type { ProductType } from "@prisma/client";

function productTypeToChannel(type: ProductType | null | undefined): ChannelKey {
  if (type === "otp_sms") return "sms";
  if (type === "otp_whatsapp") return "whatsapp";
  return "general";
}

export async function approveOrder(formData: FormData) {
  const session = await requireAdmin();
  const orderId = String(formData.get("orderId"));

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return;
  if (order.status === "approved") return;

  for (const item of order.items) {
    const channel = productTypeToChannel(item.product?.type);
    const total = item.creditAmount * item.quantity;
    if (total <= 0) continue;
    await creditWallet({
      clientId: order.clientId,
      channel,
      amount: total,
      type: "credit",
      description: `Order ${order.orderNumber} approved — ${item.name}`,
      referenceType: "order",
      referenceId: order.id,
    });
  }

  await db.order.update({
    where: { id: orderId },
    data: {
      status: "approved",
      paidAt: new Date(),
      approvedAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: "order.approve",
      entityType: "order",
      entityId: order.id,
      newValues: { orderNumber: order.orderNumber, total: Number(order.total) },
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/wallet");
}

export async function rejectOrder(formData: FormData) {
  const session = await requireAdmin();
  const orderId = String(formData.get("orderId"));

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await db.order.update({
    where: { id: orderId },
    data: { status: "rejected", rejectedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId: session.userId,
      action: "order.reject",
      entityType: "order",
      entityId: order.id,
      newValues: { orderNumber: order.orderNumber },
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
}
