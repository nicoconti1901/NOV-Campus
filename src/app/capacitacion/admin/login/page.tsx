"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { siteConfig } from "@/lib/data";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/capacitacion/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al iniciar sesión");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-brand-black/70 shadow-2xl backdrop-blur-md">
        <div className="bg-gradient-to-br from-brand-dark to-brand-navy px-8 py-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/20 text-brand-orange">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-semibold uppercase tracking-[0.08em]">Capacitadores</h1>
          <p className="mt-1 text-sm text-white/70">{siteConfig.tagline}</p>
        </div>

        <div className="p-8">
          <Link href="/capacitacion" className="flex justify-center">
            <BrandLogo size="lg" />
          </Link>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
            {error && <p className="text-sm text-brand-orange">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-orange py-3 text-sm font-semibold text-brand-black transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <Link
            href="/capacitacion"
            className="mt-6 block text-center text-sm text-white/50 transition-colors hover:text-brand-orange"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
