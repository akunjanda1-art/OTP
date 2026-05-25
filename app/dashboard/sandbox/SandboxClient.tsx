"use client";

import { useState } from "react";

export default function SandboxClient() {
  const [apiKey, setApiKey] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("sms");
  const [purpose, setPurpose] = useState("login");
  const [otp, setOtp] = useState("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function call(endpoint: string, body: Record<string, unknown>) {
    setLoading(true);
    setResponse("");
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      setResponse(JSON.stringify(json, null, 2));
    } catch (e) {
      setResponse(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          API Key (Bearer)
        </label>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="otp_..."
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm focus:border-indigo-500 outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-semibold mb-2">POST /api/v1/otp/send</h3>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="6281234567890"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
          />
          <div className="flex gap-2">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
            >
              <option value="sms">sms</option>
              <option value="whatsapp">whatsapp</option>
              <option value="email">email</option>
              <option value="voice">voice</option>
            </select>
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="purpose"
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
            />
          </div>
          <button
            onClick={() =>
              call("/api/v1/otp/send", { phone, channel, purpose })
            }
            disabled={loading}
            className="w-full py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium disabled:opacity-50"
          >
            Send OTP
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-semibold mb-2">POST /api/v1/otp/verify</h3>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm tracking-widest text-center outline-none"
          />
          <button
            onClick={() =>
              call("/api/v1/otp/verify", { phone, otp, purpose })
            }
            disabled={loading}
            className="w-full py-2 rounded bg-green-600 text-white text-sm font-medium disabled:opacity-50"
          >
            Verify OTP
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="font-semibold mb-2 text-sm text-slate-400">Response</h3>
        <pre className="bg-slate-950 rounded-lg p-4 text-xs overflow-x-auto text-slate-300 min-h-[120px]">
          {response || "(tidak ada response)"}
        </pre>
      </div>
    </div>
  );
}
