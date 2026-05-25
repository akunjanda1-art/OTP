import RegisterForm from "./RegisterForm";
import Link from "next/link";

export const metadata = { title: "Daftar - OTPGo" };

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
              O
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              OTPGo
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold">Daftar Akun Bisnis</h1>
          <p className="text-slate-400 mt-2">Mulai kirim OTP dalam 3 menit</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <RegisterForm />
        </div>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Login di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
