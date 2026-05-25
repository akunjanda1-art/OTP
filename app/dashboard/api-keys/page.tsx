import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { createApiKey, revokeApiKey } from "./actions";
import CopyKeyBanner from "./CopyKeyBanner";

export const metadata = { title: "API Keys - OTPGo" };

export default async function ApiKeysPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; prefix?: string }>;
}) {
  const session = await requireClient();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });

  const params = await searchParams;
  const justCreated = params.created;

  const keys = await db.apiKey.findMany({
    where: { clientId: session.clientId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell role="client" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-slate-400 mt-1">
          Kelola token untuk integrasi API. Setiap key hanya ditampilkan satu kali.
        </p>
      </div>

      {justCreated && <CopyKeyBanner plaintext={justCreated} prefix={params.prefix ?? ""} />}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <form action={createApiKey} className="flex gap-3">
          <input
            name="name"
            required
            placeholder="Contoh: Production Backend"
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium"
          >
            + Buat API Key
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Nama</th>
              <th className="px-6 py-3 text-left">Prefix</th>
              <th className="px-6 py-3 text-left">Rate Limit</th>
              <th className="px-6 py-3 text-left">Last Used</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  Belum ada API key. Buat yang pertama di atas.
                </td>
              </tr>
            )}
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-slate-800">
                <td className="px-6 py-4 font-medium">{k.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">
                  {k.keyPrefix}…
                </td>
                <td className="px-6 py-4">{k.rateLimitPerMinute}/min</td>
                <td className="px-6 py-4 text-slate-400">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("id-ID") : "—"}
                </td>
                <td className="px-6 py-4">
                  {k.isActive ? (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs">
                      active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs">
                      revoked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {k.isActive && (
                    <form action={revokeApiKey}>
                      <input type="hidden" name="id" value={k.id} />
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Revoke
                      </button>
                    </form>
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
