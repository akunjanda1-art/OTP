import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { approveOrder, rejectOrder } from "./actions";

export const metadata = { title: "Orders - Admin" };

export default async function AdminOrdersPage() {
  const session = await requireAdmin();
  const [user, orders] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { include: { user: true } }, items: true },
      take: 100,
    }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-slate-400 mt-1">
          Approve order manual transfer untuk top-up saldo klien.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Order #</th>
              <th className="px-4 py-3 text-left">Klien</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Waktu</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-4 py-3">
                  <div>{o.client.businessName}</div>
                  <div className="text-xs text-slate-500">{o.client.user.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {o.items.map((it) => `${it.name} (${it.creditAmount})`).join(", ")}
                </td>
                <td className="px-4 py-3 text-right">
                  Rp {Number(o.total).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      o.status === "approved"
                        ? "bg-green-500/10 text-green-400"
                        : o.status === "rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  {(o.status === "pending" ||
                    o.status === "waiting_payment" ||
                    o.status === "paid") && (
                    <div className="flex gap-2">
                      <form action={approveOrder}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <button className="text-xs text-green-400 hover:text-green-300">
                          Approve
                        </button>
                      </form>
                      <form action={rejectOrder}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <button className="text-xs text-red-400 hover:text-red-300">
                          Reject
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
