"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { LoginStage } from "@/components/capacitacion/LoginStage";
import { formFieldClass, formLabelClass } from "@/lib/capacitacion/form-styles";
import {
  resolveStaffRedirect,
  type StaffPortal,
} from "@/lib/capacitacion/admin-access";
import { siteConfig } from "@/lib/data";

const PORTAL = {
  trainer: {
    title: "Capacitadores",
    hint: siteConfig.tagline,
    overlay: "bg-linear-to-br from-emerald-950/82 via-brand-navy/68 to-amber-950/50",
  },
  company: {
    title: "Representante de la empresa",
    hint: "Solo consulta de progreso y cumplimiento",
    overlay: "bg-linear-to-br from-amber-950/80 via-brand-navy/70 to-orange-950/55",
  },
} as const;

type Props = {
  portal: StaffPortal;
};

export function StaffLoginForm({ portal }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = PORTAL[portal];
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

    const data = (await res.json().catch(() => ({}))) as { role?: string; error?: string };

    if (res.ok) {
      router.push(resolveStaffRedirect(data.role, searchParams.get("next"), portal));
      router.refresh();
    } else {
      setError(data.error ?? "Error al iniciar sesion");
    }
    setLoading(false);
  }

  return (
    <LoginStage
      imageSrc="/images/fondo1.avif"
      imageAlt="Fondo de formacion digital"
      overlay={copy.overlay}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-amber-50/92 ring-1 ring-amber-200/70 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl"
      >
        <div className="bg-brand-navy px-8 py-6 text-center text-paper">
          <h1 className="font-display text-xl font-semibold uppercase tracking-[0.08em]">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-paper/75">{copy.hint}</p>
        </div>

        <div className="p-8">
          <Link href="/capacitacion" className="flex justify-center rounded-2xl bg-brand-navy px-4 py-3">
            <BrandLogo size="lg" priority />
          </Link>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className={formLabelClass}>Email</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={formFieldClass}
              />
            </div>
            <div>
              <label className={formLabelClass}>Clave</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={formFieldClass}
              />
            </div>
            {error && <p className="text-sm text-brand-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-red py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-red-dark disabled:translate-y-0 disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <Link
            href="/capacitacion"
            className="mt-6 block text-center text-sm text-ink-muted transition-colors hover:text-brand-red"
          >
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </LoginStage>
  );
}
