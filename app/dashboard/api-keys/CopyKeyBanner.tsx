"use client";

import { useState } from "react";

export default function CopyKeyBanner({
  plaintext,
  prefix,
}: {
  plaintext: string;
  prefix: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">⚠️</div>
        <div>
          <h3 className="font-semibold text-amber-200">
            Simpan API Key Anda sekarang!
          </h3>
          <p className="text-sm text-amber-100/80 mt-1">
            Key ini hanya ditampilkan SEKALI. Setelah halaman direfresh, key tidak
            akan bisa dilihat lagi (hanya prefix <code className="bg-slate-800 px-1.5 py-0.5 rounded">{prefix}…</code>).
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg p-3 font-mono text-sm break-all">
        <span className="flex-1 text-amber-200">{plaintext}</span>
        <button
          onClick={copy}
          className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-xs whitespace-nowrap"
        >
          {copied ? "✓ Tersalin" : "Copy"}
        </button>
      </div>
    </div>
  );
}
