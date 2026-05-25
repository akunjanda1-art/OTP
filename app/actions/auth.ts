"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { ensureWallet } from "@/lib/wallet";

const RegisterSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  businessName: z.string().min(2).max(150).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(8).max(20).optional(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Harus mengandung huruf")
    .regex(/[0-9]/, "Harus mengandung angka"),
  agreeTos: z.string().optional(),
});

export type AuthFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function registerClient(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
    agreeTos: formData.get("agreeTos") ?? undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!parsed.data.agreeTos) {
    return { message: "Anda harus menyetujui Terms of Service" };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { message: "Email sudah terdaftar" };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      password: hashed,
      role: "client",
      status: "active",
      client: {
        create: {
          businessName: parsed.data.businessName,
          status: "active",
        },
      },
    },
    include: { client: true },
  });

  if (user.client) {
    await ensureWallet(user.client.id);
  }

  await createSession({
    userId: user.id,
    role: user.role,
    clientId: user.client?.id ?? null,
  });

  redirect("/dashboard");
}

const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export async function loginUser(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    include: { client: true },
  });

  if (!user) {
    return { message: "Email atau password salah" };
  }
  if (user.status === "suspended") {
    return { message: "Akun Anda di-suspend. Hubungi support." };
  }

  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) {
    return { message: "Email atau password salah" };
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    clientId: user.client?.id ?? null,
  });

  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}
