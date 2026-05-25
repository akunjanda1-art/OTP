import { requireClient } from "@/lib/dal";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import SandboxClient from "./SandboxClient";

export const metadata = { title: "Sandbox - OTPGo" };

export default async function SandboxPage() {
  const session = await requireClient();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });
  return (
    <DashboardShell role="client" userName={user?.name ?? ""}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sandbox</h1>
        <p className="text-slate-400 mt-1">
          Tes endpoint <code className="text-indigo-400">/api/v1/otp/send</code> dan{" "}
          <code className="text-indigo-400">/api/v1/otp/verify</code> dengan API key Anda.
        </p>
      </div>
      <SandboxClient />
    </DashboardShell>
  );
}
