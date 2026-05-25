import Link from "next/link";
import { logoutUser } from "@/app/actions/auth";

type NavItem = { href: string; label: string; icon: string };

export default function DashboardShell({
  role,
  userName,
  children,
}: {
  role: "admin" | "client";
  userName: string;
  children: React.ReactNode;
}) {
  const clientNav: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/wallet", label: "Saldo", icon: "💰" },
    { href: "/dashboard/api-keys", label: "API Keys", icon: "🔑" },
    { href: "/dashboard/otp-logs", label: "OTP Logs", icon: "📜" },
    { href: "/dashboard/orders", label: "Orders", icon: "🛒" },
    { href: "/dashboard/numbers", label: "Numbers", icon: "📞" },
    { href: "/dashboard/sandbox", label: "Sandbox", icon: "🧪" },
    { href: "/docs", label: "API Docs", icon: "📖" },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/clients", label: "Clients", icon: "👥" },
    { href: "/admin/products", label: "Products", icon: "📦" },
    { href: "/admin/orders", label: "Orders", icon: "🛒" },
    { href: "/admin/otp-logs", label: "OTP Logs", icon: "📜" },
    { href: "/admin/providers", label: "Providers", icon: "🔌" },
    { href: "/admin/numbers", label: "Numbers", icon: "📞" },
    { href: "/admin/audit", label: "Audit Logs", icon: "🛡️" },
  ];

  const nav = role === "admin" ? adminNav : clientNav;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <Link href="/" className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
            O
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              OTPGo
            </div>
            <div className="text-xs text-slate-500 uppercase">{role}</div>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="text-sm text-slate-300 mb-2 truncate">{userName}</div>
          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full text-left text-sm text-slate-400 hover:text-white"
            >
              ↩ Logout
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
