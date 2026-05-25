import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { createOrder } from "./actions";

export const metadata = { title: "Orders - OTPGo" };

export default async function OrdersPage() {
  const session = await requireClient();
  const [user, orders, products] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.order.findMany({
      where: { clientId: session.clientId! },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    db.product.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }),
  ]);

  return (
    <DashboardShell role="client" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-slate-400 mt-1">
          Beli paket OTP. Setelah admin approve, saldo bertambah otomatis.
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-3">Pilih Paket</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {products.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-slate-400 text-sm mt-1">{p.description ?? ""}</p>
            <div className="text-2xl font-bold mt-3">
              Rp {Number(p.price).toLocaleString("id-ID")}
            </div>
            <div className="text-xs text-slate-500 mb-4">
              {p.creditAmount.toLocaleString("id-ID")} credits · {p.validityDays} hari
            </div>
            <form action={createOrder}>
              <input type="hidden" name="productId" value={p.id} />
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium">
                Beli Sekarang
              </button>
            </form>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-3">Riwayat Order</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Order #</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Belum ada order. Beli paket di atas.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-4 py-3 text-slate-400">
                  {o.items.map((it) => it.name).join(", ")}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  Rp {Number(o.total).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <OrderBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function OrderBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-500/10 text-green-400",
    paid: "bg-blue-500/10 text-blue-400",
    pending: "bg-slate-500/10 text-slate-400",
    waiting_payment: "bg-amber-500/10 text-amber-400",
    rejected: "bg-red-500/10 text-red-400",
    expired: "bg-slate-500/10 text-slate-400",
    cancelled: "bg-slate-500/10 text-slate-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${map[status] ?? "bg-slate-800"}`}>
      {status}
    </span>
  );
}
