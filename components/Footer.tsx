import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
              O
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              OTPGo
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            OTP Gateway multi-channel untuk bisnis Anda.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Produk</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#features" className="hover:text-white">Fitur</a></li>
            <li><a href="#pricing" className="hover:text-white">Harga</a></li>
            <li><Link href="/docs" className="hover:text-white">API Docs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Perusahaan</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#contact" className="hover:text-white">Kontak</a></li>
            <li><Link href="/tos" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Akun</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/login" className="hover:text-white">Login</Link></li>
            <li><Link href="/register" className="hover:text-white">Daftar</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} OTPGo. All rights reserved.</p>
        <p>Made with ❤️ for Indonesian businesses</p>
      </div>
    </footer>
  );
}
