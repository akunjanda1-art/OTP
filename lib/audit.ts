import "server-only";
import { db } from "./db";

export async function logAudit(params: {
  userId?: string | null;
  clientId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: unknown;
  newValues?: unknown;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId ?? null,
        clientId: params.clientId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        oldValues: (params.oldValues ?? null) as never,
        newValues: (params.newValues ?? null) as never,
      },
    });
  } catch (e) {
    // never block business logic for audit failure
    // eslint-disable-next-line no-console
    console.error("[audit] failed:", e);
  }
}
