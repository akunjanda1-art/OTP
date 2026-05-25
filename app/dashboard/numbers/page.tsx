import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Virtual Numbers - OTPGo" };

export default async function NumbersPage() {
  const session = await requireClient();
  const [user, numbers] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.dedicatedNumber.findMany({
      where: { clientId: session.clientId! },
      orderBy: { assignedAt: "desc" },
    }),
  ]);

  return (
    <DashboardShell role="client" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Virtual Numbers</h1>
        <p className="text-slate-400 mt-1">
          Nomor sewa untuk menerima OTP/SMS. Hubungi admin untuk request nomor baru.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nomor</th>
              <th className="px-4 py-3 text-left">Negara</th>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Disewa</th>
              <th className="px-4 py-3 text-left">Berlaku Hingga</th>
            </tr>
          </thead>
          <tbody>
            {numbers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Belum punya nomor virtual. Hubungi admin untuk sewa.
                </td>
              </tr>
            )}
            {numbers.map((n) => (
              <tr key={n.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono">{n.number}</td>
                <td className="px-4 py-3 text-slate-400">{n.countryCode ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">{n.providerName ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      n.status === "assigned"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {n.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {n.assignedAt ? new Date(n.assignedAt).toLocaleDateString("id-ID") : "—"}
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {n.expiresAt ? new Date(n.expiresAt).toLocaleDateString("id-ID") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
