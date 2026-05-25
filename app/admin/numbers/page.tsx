import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { createNumber, assignNumber } from "./actions";

export const metadata = { title: "Virtual Numbers - Admin" };

export default async function AdminNumbersPage() {
  const session = await requireAdmin();
  const [user, numbers, clients] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.dedicatedNumber.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { include: { user: true } } },
    }),
    db.client.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Virtual Numbers</h1>
        <p className="text-slate-400 mt-1">Kelola pool nomor & assignment ke klien.</p>
      </div>

      <form
        action={createNumber}
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-8 grid md:grid-cols-5 gap-3"
      >
        <input
          name="number"
          required
          placeholder="6281234567890"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm font-mono outline-none"
        />
        <input
          name="countryCode"
          defaultValue="ID"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <input
          name="providerName"
          required
          placeholder="provider"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <input
          name="monthlyFee"
          type="number"
          defaultValue={0}
          placeholder="Tarif/bulan"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium">
          Tambah ke Pool
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nomor</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Klien</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Assign</th>
            </tr>
          </thead>
          <tbody>
            {numbers.map((n) => (
              <tr key={n.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono">{n.number}</td>
                <td className="px-4 py-3">{n.countryCode ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">{n.providerName ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {n.client ? n.client.businessName : "— (pool)"}
                </td>
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
                <td className="px-4 py-3">
                  <form action={assignNumber} className="flex gap-1">
                    <input type="hidden" name="numberId" value={n.id} />
                    <select
                      name="clientId"
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs outline-none"
                      defaultValue={n.clientId ?? ""}
                    >
                      <option value="">— unassign —</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.businessName}
                        </option>
                      ))}
                    </select>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 px-2">
                      Save
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
