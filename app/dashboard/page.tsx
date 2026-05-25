import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Dashboard - OTPGo" };

export default async function DashboardPage() {
  const session = await requireClient();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { client: { include: { wallet: true } } },
  });
  if (!user?.client) return null;

  const clientId = user.client.id;
  const wallet = user.client.wallet;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayCount, todaySuccess, todayFailed, lastOrder, activeKeys] =
    await Promise.all([
      db.otpRequest.count({ where: { clientId, createdAt: { gte: startOfDay } } }),
      db.otpRequest.count({
        where: {
          clientId,
          createdAt: { gte: startOfDay },
          status: { in: ["sent", "verified"] },
        },
      }),
      db.otpRequest.count({
        where: {
          clientId,
          createdAt: { gte: startOfDay },
          status: { in: ["failed", "expired"] },
        },
      }),
      db.order.findFirst({
        where: { clientId },
        orderBy: { createdAt: "desc" },
      }),
      db.apiKey.count({ where: { clientId, isActive: true } }),
    ]);

  const successRate = todayCount > 0
    ? Math.round((todaySuccess / todayCount) * 100)
    : 0;

  return (
    <DashboardShell role="client" userName={user.name}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Halo, {user.name} 👋</h1>
        <p className="text-slate-400 mt-1">{user.client.businessName}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Saldo SMS"
          value={wallet?.smsCredit ?? 0}
          icon="📱"
          alert={(wallet?.smsCredit ?? 0) < 100}
        />
        <StatCard label="Saldo WhatsApp" value={wallet?.whatsappCredit ?? 0} icon="💬" />
        <StatCard label="Saldo Umum" value={wallet?.generalCredit ?? 0} icon="💰" />
        <StatCard label="API Keys Aktif" value={activeKeys} icon="🔑" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <StatCard label="OTP Hari Ini" value={todayCount} icon="📤" />
        <StatCard label="Berhasil" value={todaySuccess} icon="✅" />
        <StatCard label="Gagal" value={todayFailed} icon="❌" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="font-semibold mb-2">Success Rate Hari Ini</h3>
          <div className="text-4xl font-bold text-green-400">{successRate}%</div>
          <p className="text-slate-400 text-sm mt-2">
            Berdasarkan {todayCount} permintaan hari ini.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="font-semibold mb-2">Order Terakhir</h3>
          {lastOrder ? (
            <>
              <div className="text-sm text-slate-400">#{lastOrder.orderNumber}</div>
              <div className="text-2xl font-bold mt-1">
                Rp {Number(lastOrder.total).toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Status: <span className="font-medium">{lastOrder.status}</span>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Belum ada order.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  alert,
}: {
  label: string;
  value: number | string;
  icon: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-2xl border ${
        alert
          ? "bg-amber-500/5 border-amber-500/30"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{label}</div>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {alert && (
        <div className="text-xs text-amber-400 mt-1">⚠ Saldo rendah</div>
      )}
    </div>
  );
}
