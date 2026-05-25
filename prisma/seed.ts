import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------- Admin user ----------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@otpgo.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrator",
      password: adminHash,
      role: "admin",
      status: "active",
    },
  });
  console.log(`✓ Admin user: ${admin.email} (password: ${adminPassword})`);

  // ---------------- Demo client ----------------
  const demoEmail = "demo@otpgo.local";
  const demoHash = await bcrypt.hash("demo12345", 10);
  const demoUser = await db.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Client",
      password: demoHash,
      role: "client",
      status: "active",
      client: {
        create: {
          businessName: "Demo Business",
          status: "active",
          wallet: { create: { smsCredit: 100, whatsappCredit: 100, generalCredit: 100 } },
        },
      },
    },
    include: { client: true },
  });
  console.log(`✓ Demo client: ${demoUser.email} (password: demo12345)`);

  // ---------------- Sample products ----------------
  const products = [
    {
      slug: "sms-starter-1000",
      name: "SMS Starter",
      description: "1.000 SMS OTP untuk usaha kecil",
      type: "otp_sms" as const,
      channel: "sms" as const,
      creditAmount: 1000,
      price: 250000,
    },
    {
      slug: "sms-pro-5000",
      name: "SMS Pro",
      description: "5.000 SMS OTP, hemat untuk bisnis berkembang",
      type: "otp_sms" as const,
      channel: "sms" as const,
      creditAmount: 5000,
      price: 1100000,
    },
    {
      slug: "wa-starter-2000",
      name: "WhatsApp Starter",
      description: "2.000 OTP via WhatsApp Business",
      type: "otp_whatsapp" as const,
      channel: "whatsapp" as const,
      creditAmount: 2000,
      price: 300000,
    },
    {
      slug: "bundle-mix-3000",
      name: "Bundle Mix",
      description: "1.500 SMS + 1.500 WhatsApp",
      type: "otp_bundle" as const,
      creditAmount: 3000,
      price: 500000,
    },
    {
      slug: "dedicated-number-id",
      name: "Dedicated Number (ID)",
      description: "Sewa nomor virtual Indonesia 1 bulan",
      type: "dedicated_number" as const,
      creditAmount: 0,
      price: 750000,
    },
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, validityDays: 30, isActive: true },
    });
  }
  console.log(`✓ ${products.length} sample products`);

  // ---------------- Default provider (dummy) ----------------
  await db.providerSetting.upsert({
    where: { name: "dummy" },
    update: {},
    create: {
      name: "dummy",
      type: "multi",
      isActive: true,
      priority: 1,
      config: { simulated: true },
    },
  });
  console.log(`✓ Dummy provider registered`);

  console.log("✅ Seed complete\n");
  console.log(`Login admin: ${adminEmail} / ${adminPassword}`);
  console.log(`Login client demo: ${demoEmail} / demo12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
