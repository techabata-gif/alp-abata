"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";


export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login gagal");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud px-4">
      <div className="w-full max-w-md rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col items-center gap-3">
          <Link 
            href="/" 
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf shadow-sm overflow-hidden hover:opacity-90 transition"
            title="Kembali ke Halaman Utama"
          >
            <img src="/logo.png" alt="Abata Logo" className="h-full w-full object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-ink">Admin Login</h1>
          <p className="text-sm text-ink/60">Masuk untuk mengelola platform</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Email atau Username
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="admin / nama@email.com"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Login"}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-leaf transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
