import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "OTP Logs - Admin" };

export default async function AdminOtpLogsPage() {
  const session = await requireAdmin();
  const [user, requests] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.otpRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { client: { include: { user: true } } },
    }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">OTP Logs</h1>
        <p className="text-slate-400 mt-1">200 request OTP terbaru (semua klien).</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Waktu</th>
              <th className="px-4 py-3 text-left">Klien</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Channel</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Provider</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-slate-800">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-slate-400">{r.client.user.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.phone}</td>
                <td className="px-4 py-3">{r.channel}</td>
                <td className="px-4 py-3 text-slate-400">{r.purpose}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      r.status === "verified"
                        ? "bg-green-500/10 text-green-400"
                        : r.status === "sent"
                          ? "bg-blue-500/10 text-blue-400"
                          : r.status === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{r.providerName ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
