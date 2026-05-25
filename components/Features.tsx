const features = [
  {
    icon: "📨",
    title: "Multi-channel",
    desc: "Kirim OTP via SMS, WhatsApp, Email, atau Voice Call dengan satu API.",
  },
  {
    icon: "⚡",
    title: "Pengiriman Cepat",
    desc: "Latency p95 < 3 detik. Provider failover otomatis untuk maximum uptime.",
  },
  {
    icon: "🔒",
    title: "Aman & Compliant",
    desc: "OTP di-hash, API key di-rotate, rate limiting per nomor & per IP.",
  },
  {
    icon: "💳",
    title: "Wallet Credit",
    desc: "Sistem prepaid credit. Saldo dipotong hanya saat OTP berhasil terkirim.",
  },
  {
    icon: "📊",
    title: "Real-time Dashboard",
    desc: "Pantau success rate, delivery status, dan biaya secara live.",
  },
  {
    icon: "🔗",
    title: "Webhook Callback",
    desc: "Dapatkan event delivery, verified, dan failed via webhook ke server Anda.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Semua yang Anda butuhkan untuk verifikasi user
          </h2>
          <p className="text-slate-400">
            Built untuk developer Indonesia. Dokumentasi lengkap, sandbox gratis,
            integrasi 5 menit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
