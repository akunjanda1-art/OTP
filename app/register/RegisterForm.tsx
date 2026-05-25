"use client";

import { useActionState } from "react";
import { registerClient, type AuthFormState } from "@/app/actions/auth";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    registerClient,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Lengkap (PIC)</label>
        <input
          name="name"
          required
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
          placeholder="Budi Santoso"
        />
        {state?.errors?.name && (
          <p className="text-red-400 text-xs mt-1">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Bisnis</label>
        <input
          name="businessName"
          required
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
          placeholder="PT Maju Jaya"
        />
        {state?.errors?.businessName && (
          <p className="text-red-400 text-xs mt-1">{state.errors.businessName[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
          placeholder="you@example.com"
        />
        {state?.errors?.email && (
          <p className="text-red-400 text-xs mt-1">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Nomor HP (opsional)</label>
        <input
          name="phone"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
          placeholder="08123456789"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
          placeholder="Min 8 karakter, huruf + angka"
        />
        {state?.errors?.password && (
          <ul className="text-red-400 text-xs mt-1 list-disc list-inside">
            {state.errors.password.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-300">
        <input type="checkbox" name="agreeTos" value="1" className="mt-0.5" required />
        <span>
          Saya setuju dengan Terms of Service dan tidak akan menggunakan layanan untuk
          spam atau bypass akun pihak ketiga.
        </span>
      </label>

      {state?.message && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium transition"
      >
        {pending ? "Memproses..." : "Daftar Sekarang"}
      </button>
    </form>
  );
}
