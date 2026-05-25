import Link from "next/link";

const plans = [
  {
    name: "Starter SMS",
    price: "Rp 250.000",
    credit: "1.000 OTP SMS",
    features: ["API Key", "Dashboard Log", "Masa aktif 30 hari", "Email support"],
    cta: "Mulai",
    href: "/register",
  },
  {
    name: "WhatsApp OTP",
    price: "Rp 200.000",
    credit: "1.000 OTP WA",
    features: [
      "Template authentication",
      "Higher deliverability",
      "Dashboard log",
      "Masa aktif 30 hari",
    ],
    cta: "Mulai",
    href: "/register",
    highlight: true,
  },
  {
    name: "API Gateway",
    price: "Rp 1.500.000",
    credit: "SMS + WA Bulanan",
    features: [
      "Fallback channel",
      "Rate limit custom",
      "Priority queue",
      "Webhook callback",
      "24/7 support",
    ],
    cta: "Hubungi Sales",
    href: "#contact",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Harga Transparan</h2>
          <p className="text-slate-400">
            Bayar sesuai pemakaian. Tidak ada biaya tersembunyi. Setup gratis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border ${
                p.highlight
                  ? "bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/50 relative"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full">
                  POPULAR
                </div>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-4">
                <div className="text-3xl font-bold">{p.price}</div>
                <div className="text-slate-400 text-sm mt-1">{p.credit}</div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-300">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`block text-center mt-8 py-2.5 rounded-lg font-medium transition ${
                  p.highlight
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
