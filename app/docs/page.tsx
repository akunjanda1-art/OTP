import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "API Docs - OTPGo" };

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
        <p className="text-slate-400 mb-10">
          REST API v1 untuk OTP send / verify / resend / status. Semua endpoint
          memerlukan header <code className="text-indigo-400">Authorization: Bearer otp_…</code>.
        </p>

        <Section title="Base URL">
          <Code>{`${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/v1`}</Code>
        </Section>

        <Section title="Authentication">
          <p className="text-slate-300 mb-3">
            Buat API key di <a className="text-indigo-400" href="/dashboard/api-keys">Dashboard → API Keys</a>.
            Plaintext key hanya tampil sekali — simpan dengan aman.
          </p>
          <Code>{`Authorization: Bearer otp_xxxxxxxxxxxxxxxxxxxxxxxx`}</Code>
        </Section>

        <Endpoint
          method="POST"
          path="/api/v1/otp/send"
          desc="Generate & kirim OTP ke nomor tujuan via channel pilihan."
          body={{
            phone: "6281234567890",
            channel: "sms | whatsapp | email | voice",
            purpose: "login",
            callback_url: "https://your.app/webhook (optional)",
          }}
          success={{
            ok: true,
            data: {
              request_id: "01J...",
              phone: "6281234567890",
              channel: "sms",
              status: "sent",
              expires_in: 300,
            },
          }}
          curl={`curl -X POST '${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/v1/otp/send' \\
  -H 'Authorization: Bearer otp_xxx' \\
  -H 'Content-Type: application/json' \\
  -d '{"phone":"6281234567890","channel":"sms","purpose":"login"}'`}
        />

        <Endpoint
          method="POST"
          path="/api/v1/otp/verify"
          desc="Verifikasi kode OTP yang diterima user."
          body={{ phone: "6281234567890", otp: "123456", purpose: "login" }}
          success={{
            ok: true,
            data: { verified: true, verified_at: "2026-01-01T00:00:00Z" },
          }}
          curl={`curl -X POST '${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/v1/otp/verify' \\
  -H 'Authorization: Bearer otp_xxx' \\
  -H 'Content-Type: application/json' \\
  -d '{"phone":"6281234567890","otp":"123456","purpose":"login"}'`}
        />

        <Endpoint
          method="POST"
          path="/api/v1/otp/resend"
          desc="Kirim ulang OTP (cooldown default 60 detik)."
          body={{ phone: "6281234567890", channel: "sms", purpose: "login" }}
          success={{ ok: true, data: { request_id: "01J...", expires_in: 300 } }}
          curl={`curl -X POST '${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/v1/otp/resend' \\
  -H 'Authorization: Bearer otp_xxx' \\
  -H 'Content-Type: application/json' \\
  -d '{"phone":"6281234567890","channel":"sms","purpose":"login"}'`}
        />

        <Endpoint
          method="GET"
          path="/api/v1/otp/status/{request_id}"
          desc="Cek status OTP berdasarkan request_id."
          success={{
            ok: true,
            data: {
              request_id: "01J...",
              status: "verified",
              delivery_status: "delivered",
              verified_at: "2026-01-01T00:00:00Z",
            },
          }}
          curl={`curl '${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/v1/otp/status/01J...' \\
  -H 'Authorization: Bearer otp_xxx'`}
        />

        <Endpoint
          method="GET"
          path="/api/v1/balance"
          desc="Cek saldo credit per channel."
          success={{
            ok: true,
            data: { sms: 980, whatsapp: 500, general: 100 },
          }}
          curl={`curl '${process.env.NEXT_PUBLIC_APP_URL ?? "https://your-domain.com"}/api/v1/balance' \\
  -H 'Authorization: Bearer otp_xxx'`}
        />

        <Section title="Error Codes (PRD §9)">
          <table className="w-full text-sm border border-slate-800 rounded">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Arti</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                ["VALIDATION_ERROR", "Body tidak valid"],
                ["UNAUTHORIZED", "API key invalid / tidak ada"],
                ["FORBIDDEN", "Akses ditolak"],
                ["RATE_LIMITED", "Terlalu banyak permintaan"],
                ["INSUFFICIENT_BALANCE", "Saldo channel tidak cukup"],
                ["OTP_NOT_FOUND", "OTP tidak ada / sudah verified"],
                ["OTP_EXPIRED", "OTP kadaluarsa"],
                ["INVALID_OTP", "OTP salah"],
                ["MAX_ATTEMPT_REACHED", "Percobaan habis"],
                ["PROVIDER_ERROR", "Provider gagal mengirim"],
                ["CHANNEL_NOT_AVAILABLE", "Channel tidak tersedia"],
                ["INTERNAL_ERROR", "Kesalahan server"],
              ].map(([code, desc]) => (
                <tr key={code} className="border-t border-slate-800">
                  <td className="px-3 py-2 font-mono text-xs text-amber-400">{code}</td>
                  <td className="px-3 py-2 text-slate-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Rate Limits">
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            <li>Per API key: 60 request/menit (configurable per key)</li>
            <li>Per nomor + purpose: 3 OTP per 10 menit</li>
            <li>Resend cooldown: 60 detik antar request</li>
            <li>Verify: maks 3 percobaan per OTP</li>
          </ul>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto">
      {children}
    </pre>
  );
}

function Endpoint({
  method,
  path,
  desc,
  body,
  success,
  curl,
}: {
  method: string;
  path: string;
  desc: string;
  body?: object;
  success: object;
  curl: string;
}) {
  const color = method === "GET" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400";
  return (
    <section className="mb-10 p-6 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${color}`}>{method}</span>
        <code className="text-sm text-slate-200">{path}</code>
      </div>
      <p className="text-slate-400 text-sm mb-4">{desc}</p>

      {body && (
        <>
          <h4 className="text-xs uppercase text-slate-500 mb-1">Request Body</h4>
          <Code>{JSON.stringify(body, null, 2)}</Code>
        </>
      )}

      <h4 className="text-xs uppercase text-slate-500 mb-1 mt-3">Response 200</h4>
      <Code>{JSON.stringify(success, null, 2)}</Code>

      <h4 className="text-xs uppercase text-slate-500 mb-1 mt-3">cURL</h4>
      <Code>{curl}</Code>
    </section>
  );
}
