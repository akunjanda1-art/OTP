"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
              O
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              OTPGo
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition">
              Fitur
            </a>
            <a href="#tester" className="text-slate-300 hover:text-white transition">
              Live Demo
            </a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition">
              Harga
            </a>
            <a href="#contact" className="text-slate-300 hover:text-white transition">
              Kontak
            </a>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              Dashboard
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition"
            >
              Mulai Gratis
            </Link>
          </div>

          <button
            className="md:hidden text-slate-300"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 space-y-2 border-t border-slate-800">
            <a href="#features" className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded">
              Fitur
            </a>
            <a href="#tester" className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded">
              Live Demo
            </a>
            <a href="#pricing" className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded">
              Harga
            </a>
            <a href="#contact" className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded">
              Kontak
            </a>
            <Link href="/dashboard" className="block px-3 py-2 text-slate-300 hover:bg-slate-800 rounded">
              Dashboard
            </Link>
            <Link
              href="/register"
              className="block px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded text-center font-medium"
            >
              Mulai Gratis
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
