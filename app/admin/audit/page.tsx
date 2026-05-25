import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Audit Log - Admin" };

export default async function AdminAuditPage() {
  const session = await requireAdmin();
  const [user, logs] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: true },
    }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-slate-400 mt-1">200 entry aktivitas admin terbaru.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Waktu</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Entity</th>
              <th className="px-4 py-3 text-left">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-800">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-slate-400">{l.user?.email ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                <td className="px-4 py-3 text-slate-400">
                  {l.entityType ?? "—"}
                  {l.entityId ? ` · ${l.entityId.slice(0, 10)}…` : ""}
                </td>
                <td className="px-4 py-3 text-slate-400 truncate max-w-md font-mono text-xs">
                  {l.newValues ? JSON.stringify(l.newValues).slice(0, 80) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
