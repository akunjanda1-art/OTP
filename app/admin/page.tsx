import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Admin - OTPGo" };

export default async function AdminHome() {
  const session = await requireAdmin();
  const [user, clientCount, pendingOrders, totalOtp, todayOtp, providers] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.client.count(),
    db.order.count({ where: { status: { in: ["pending", "waiting_payment", "paid"] } } }),
    db.otpRequest.count(),
    db.otpRequest.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 3600_000) } },
    }),
    db.providerSetting.findMany({ where: { isActive: true } }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Ringkasan platform OTPGo.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Klien" value={clientCount} />
        <Stat label="Order Pending" value={pendingOrders} highlight />
        <Stat label="OTP Hari Ini" value={todayOtp} />
        <Stat label="Total OTP" value={totalOtp} />
      </div>

      <h2 className="text-xl font-semibold mb-3">Provider Aktif</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Priority</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Belum ada provider terdaftar. Gunakan dummy provider default.
                </td>
              </tr>
            )}
            {providers.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.type}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
                    active
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{p.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-2xl border ${
        highlight
          ? "bg-amber-500/5 border-amber-500/30"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <div className="text-slate-400 text-sm">{label}</div>
      <div className="text-3xl font-bold mt-2">{value.toLocaleString("id-ID")}</div>
    </div>
  );
}
