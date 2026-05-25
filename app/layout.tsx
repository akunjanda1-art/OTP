import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTPGo - Multi-channel OTP Service (SMS, WhatsApp, Email, Voice)",
  description:
    "Layanan OTP terpercaya untuk SMS, WhatsApp, Email & Voice Call. API mudah, harga transparan, deliverability tinggi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
