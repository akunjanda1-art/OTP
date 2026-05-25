"use client";

import { useActionState } from "react";
import { loginUser, type AuthFormState } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    loginUser,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="you@example.com"
        />
        {state?.errors?.email && (
          <p className="text-red-400 text-xs mt-1">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="••••••••"
        />
        {state?.errors?.password && (
          <p className="text-red-400 text-xs mt-1">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
