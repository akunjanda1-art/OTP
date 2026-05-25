import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "OTP Logs - OTPGo" };

export default async function OtpLogsPage() {
  const session = await requireClient();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });

  const logs = await db.otpRequest.findMany({
    where: { clientId: session.clientId! },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      requestId: true,
      phoneNormalized: true,
      channel: true,
      purpose: true,
      status: true,
      deliveryStatus: true,
      createdAt: true,
      verifiedAt: true,
    },
  });

  return (
    <DashboardShell role="client" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">OTP Logs</h1>
        <p className="text-slate-400 mt-1">
          100 OTP terakhir. Kode OTP asli tidak ditampilkan (disimpan hash).
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Request ID</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Channel</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Delivery</th>
              <th className="px-4 py-3 text-left">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Belum ada OTP. Kirim OTP pertama via API atau Sandbox.
                </td>
              </tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{l.requestId}</td>
                <td className="px-4 py-3">{l.phoneNormalized}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-xs">{l.channel}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{l.purpose}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">{l.deliveryStatus}</td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    verified: "bg-green-500/10 text-green-400",
    sent: "bg-blue-500/10 text-blue-400",
    queued: "bg-slate-500/10 text-slate-400",
    failed: "bg-red-500/10 text-red-400",
    expired: "bg-amber-500/10 text-amber-400",
    pending: "bg-slate-500/10 text-slate-400",
    cancelled: "bg-slate-500/10 text-slate-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${map[status] ?? "bg-slate-800"}`}>
      {status}
    </span>
  );
}
