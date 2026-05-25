"use client";

import { useState } from "react";

export default function SandboxTester() {
  const [apiKey, setApiKey] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("sms");
  const [purpose, setPurpose] = useState("login");
  const [otp, setOtp] = useState("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function call(path: string, body: object) {
    setLoading(true);
    setOutput("");
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      setOutput(JSON.stringify(j, null, 2));
    } catch (err) {
      setOutput(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            API Key (Bearer token)
          </label>
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="otp_..."
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg outline-none font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            Buat di menu API Keys. Tidak disimpan, hanya untuk testing.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="6281234567890"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg outline-none"
            >
              <option value="sms">sms</option>
              <option value="whatsapp">whatsapp</option>
              <option value="email">email</option>
              <option value="voice">voice</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Purpose</label>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg outline-none"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            disabled={loading}
            onClick={() => call("/api/v1/otp/send", { phone, channel, purpose })}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-sm"
          >
            POST /otp/send
          </button>
          <button
            disabled={loading}
            onClick={() => call("/api/v1/otp/resend", { phone, channel, purpose })}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm"
          >
            POST /otp/resend
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">OTP Code</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg outline-none font-mono text-center text-lg tracking-widest"
          />
          <button
            disabled={loading}
            onClick={() => call("/api/v1/otp/verify", { phone, otp, purpose })}
            className="mt-3 w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            POST /otp/verify
          </button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs text-slate-500 mb-2">Response</div>
        <pre className="text-xs text-slate-200 overflow-auto max-h-[600px] whitespace-pre-wrap font-mono">
          {output || "// Output akan tampil di sini"}
        </pre>
      </div>
    </div>
  );
}
