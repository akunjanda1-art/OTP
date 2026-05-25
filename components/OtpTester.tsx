"use client";

import { useState } from "react";

export default function OtpTester() {
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp" | "email" | "voice">("sms");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/demo/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, channel, purpose: "demo" }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="tester" className="py-24 bg-slate-900/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
            LIVE DEMO · SANDBOX
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Coba kirim OTP sekarang</h2>
          <p className="text-slate-400">
            Demo ini menggunakan provider dummy. Daftar untuk akses provider asli.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <form
            onSubmit={handleSend}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Nomor Tujuan
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Channel</label>
              <div className="grid grid-cols-4 gap-2">
                {(["sms", "whatsapp", "email", "voice"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`py-2 rounded-lg text-sm font-medium transition ${
                      channel === c
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium transition"
            >
              {loading ? "Mengirim..." : "Kirim OTP Demo"}
            </button>
          </form>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-auto min-h-[280px]">
            <div className="text-slate-500 mb-2">// API Response</div>
            <pre className="text-green-400 whitespace-pre-wrap">
              {result || "// Klik tombol untuk mencoba"}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
