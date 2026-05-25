import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession, type SessionPayload } from "./session";
import { db } from "./db";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await readSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const requireAdmin = cache(async (): Promise<SessionPayload> => {
  const session = await verifySession();
  if (session.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
});

export const requireClient = cache(async (): Promise<SessionPayload> => {
  const session = await verifySession();
  if (session.role !== "client" || !session.clientId) {
    redirect("/admin");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session?.userId) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      client: {
        select: {
          id: true,
          businessName: true,
          status: true,
          wallet: true,
        },
      },
    },
  });
});
