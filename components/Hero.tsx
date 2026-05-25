import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            99.99% Uptime · Pengiriman &lt; 3 detik
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            OTP via SMS, WhatsApp,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Email & Voice
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Layanan One-Time Password multi-channel terpercaya untuk verifikasi user
            Anda. Integrasi REST API mudah dengan harga paling kompetitif di Indonesia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg transition shadow-lg shadow-indigo-500/30"
            >
              Daftar Gratis - Dapat Rp 10.000
            </Link>
            <a
              href="#tester"
              className="px-8 py-4 rounded-lg border border-slate-700 hover:border-slate-500 text-white font-semibold text-lg transition"
            >
              Coba Live Demo
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <Stat value="10M+" label="OTP Terkirim" />
            <Stat value="2.500+" label="Klien Aktif" />
            <Stat value="< 3s" label="Avg Delivery" />
            <Stat value="99.99%" label="Uptime SLA" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );
}
