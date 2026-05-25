import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { toggleClientStatus } from "./actions";

export const metadata = { title: "Klien - Admin" };

export default async function AdminClientsPage() {
  const session = await requireAdmin();
  const [user, clients] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.client.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, wallet: true },
    }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Klien</h1>
        <p className="text-slate-400 mt-1">Daftar klien (tenant) yang terdaftar.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-right">SMS</th>
              <th className="px-4 py-3 text-right">WA</th>
              <th className="px-4 py-3 text-right">Umum</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-slate-800">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.businessName}</div>
                  <div className="text-xs text-slate-500 font-mono">{c.id.slice(0, 12)}…</div>
                </td>
                <td className="px-4 py-3">
                  <div>{c.user.name}</div>
                  <div className="text-xs text-slate-500">{c.user.email}</div>
                </td>
                <td className="px-4 py-3 text-right">{c.wallet?.smsCredit ?? 0}</td>
                <td className="px-4 py-3 text-right">{c.wallet?.whatsappCredit ?? 0}</td>
                <td className="px-4 py-3 text-right">{c.wallet?.generalCredit ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      c.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : c.status === "suspended"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleClientStatus}>
                    <input type="hidden" name="clientId" value={c.id} />
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">
                      Toggle Status
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
