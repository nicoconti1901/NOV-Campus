"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { LoginStage } from "@/components/capacitacion/LoginStage";
import { formFieldClass, formLabelClass } from "@/lib/capacitacion/form-styles";

type Props = {
  accessKey: string;
};

export function CampusLoginForm({ accessKey }: Props) {
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, accessKey }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "No se pudo ingresar");
        return;
      }

      await router.push(
        data.profileCompleted ? "/capacitacion/campus" : "/capacitacion/campus/perfil"
      );
    } catch {
      setError("No se pudo ingresar. Reintenta en un momento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginStage
      imageSrc="/images/fotoAlumno.png"
      imageAlt="Operario cursando en planta industrial"
      overlay="bg-linear-to-br from-slate-950/80 via-brand-navy/70 to-sky-950/55"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-sky-50/92 ring-1 ring-sky-200/80 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl"
      >
        <div className="bg-brand-navy px-8 py-6 text-center text-paper">
          <h1 className="font-display text-xl font-semibold uppercase tracking-[0.08em]">
            Campus de Capacitacion
          </h1>
          <p className="mt-1 text-sm text-paper/75">Ingreso de participantes</p>
        </div>

        <div className="p-8">
          <Link href="/capacitacion" className="flex justify-center rounded-2xl bg-brand-navy px-4 py-3">
            <BrandLogo size="lg" priority />
          </Link>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className={formLabelClass}>Número de DNI</label>
              <input
                required
                inputMode="numeric"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className={formFieldClass}
                placeholder="Ej: 30123456"
              />
            </div>
            {error && <p className="text-sm text-brand-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-red py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-red-dark disabled:translate-y-0 disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Ingresar al campus"}
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
