import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { upsertProvider, toggleProvider } from "./actions";

export const metadata = { title: "Providers - Admin" };

export default async function AdminProvidersPage() {
  const session = await requireAdmin();
  const [user, providers] = await Promise.all([
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
    db.providerSetting.findMany({ orderBy: [{ type: "asc" }, { priority: "asc" }] }),
  ]);

  return (
    <DashboardShell role="admin" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Providers</h1>
        <p className="text-slate-400 mt-1">
          Konfigurasi provider per channel. Default fallback ke <code>dummy</code> jika kosong.
          Mapping aktif diatur via env <code>SMS_PROVIDER</code>, <code>WHATSAPP_PROVIDER</code>, dst.
        </p>
      </div>

      <form
        action={upsertProvider}
        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-8 grid md:grid-cols-5 gap-3"
      >
        <input
          name="name"
          required
          placeholder="Nama unik (mis. twilio-sms)"
          className="md:col-span-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <select
          name="type"
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        >
          <option value="sms">sms</option>
          <option value="whatsapp">whatsapp</option>
          <option value="multi">multi</option>
        </select>
        <input
          name="priority"
          type="number"
          defaultValue={1}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm outline-none"
        />
        <button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium">
          Simpan
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Belum ada provider terdaftar. Default fallback = dummy provider.
                </td>
              </tr>
            )}
            {providers.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.type}</td>
                <td className="px-4 py-3 text-slate-400">{p.priority}</td>
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
                  <form action={toggleProvider}>
                    <input type="hidden" name="providerId" value={p.id} />
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
