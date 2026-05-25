import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { createProduct, toggleProductActive } from "./actions";

export const metadata = { title: "Produk - Admin" };

export default async function AdminProductsPage() {
  const session = await requireAdmin();
  const [user, products] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.product.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Produk / Paket</h1>
        <p className="text-slate-400 mt-1">Kelola paket kredit OTP yang dijual.</p>
      </div>

      <form
        action={createProduct}
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-8 grid md:grid-cols-6 gap-3"
      >
        <input
          name="name"
          required
          placeholder="Nama paket"
          className="md:col-span-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <select
          name="type"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        >
          <option value="otp_sms">OTP SMS</option>
          <option value="otp_whatsapp">OTP WhatsApp</option>
          <option value="otp_bundle">Bundle</option>
          <option value="dedicated_number">Dedicated Number</option>
          <option value="api_subscription">API Subscription</option>
          <option value="setup_service">Setup Service</option>
        </select>
        <input
          name="creditAmount"
          type="number"
          required
          placeholder="Credit"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <input
          name="price"
          type="number"
          required
          placeholder="Harga (IDR)"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium">
          Tambah
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-right">Credit</th>
              <th className="px-4 py-3 text-right">Harga</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-slate-400">{p.type}</td>
                <td className="px-4 py-3 text-right">{p.creditAmount.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-right">
                  Rp {Number(p.price).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      p.isActive
                        ? "bg-green-500/10 text-green-400"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {p.isActive ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleProductActive}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">
                      Toggle
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
