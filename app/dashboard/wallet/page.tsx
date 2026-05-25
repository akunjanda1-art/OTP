import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Saldo - OTPGo" };

export default async function WalletPage() {
  const session = await requireClient();
  const [user, wallet, txs] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    }),
    db.wallet.findUnique({ where: { clientId: session.clientId! } }),
    db.walletTransaction.findMany({
      where: { clientId: session.clientId! },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <DashboardShell role="client" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saldo / Credit</h1>
        <p className="text-slate-400 mt-1">Riwayat saldo OTP per channel.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <BalanceCard label="SMS" value={wallet?.smsCredit ?? 0} icon="📱" />
        <BalanceCard label="WhatsApp" value={wallet?.whatsappCredit ?? 0} icon="💬" />
        <BalanceCard label="Umum (Email/Voice)" value={wallet?.generalCredit ?? 0} icon="💰" />
      </div>

      <h2 className="text-xl font-semibold mb-3">Riwayat Transaksi</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Waktu</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-left">Channel</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Saldo Setelah</th>
              <th className="px-4 py-3 text-left">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
            {txs.map((t) => (
              <tr key={t.id} className="border-t border-slate-800">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(t.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <TxBadge type={t.type} />
                </td>
                <td className="px-4 py-3 text-slate-400">{t.channel ?? "—"}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {t.type === "debit" ? "−" : "+"}
                  {t.amount}
                </td>
                <td className="px-4 py-3 text-right text-slate-400">{t.balanceAfter}</td>
                <td className="px-4 py-3 text-slate-400 truncate max-w-xs">
                  {t.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function BalanceCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="text-slate-400">{label}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-4xl font-bold">{value.toLocaleString("id-ID")}</div>
      <div className="text-xs text-slate-500 mt-1">credits</div>
    </div>
  );
}

function TxBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    credit: "bg-green-500/10 text-green-400",
    debit: "bg-red-500/10 text-red-400",
    refund: "bg-blue-500/10 text-blue-400",
    adjustment: "bg-amber-500/10 text-amber-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${map[type] ?? "bg-slate-800"}`}>
      {type}
    </span>
  );
}
