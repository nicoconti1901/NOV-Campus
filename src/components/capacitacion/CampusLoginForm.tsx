"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";

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

    const res = await fetch("/api/auth/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni, accessKey }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.profileCompleted) {
        router.push("/capacitacion/campus");
      } else {
        router.push("/capacitacion/campus/perfil");
      }
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "No se pudo ingresar");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-brand-black/70 shadow-2xl backdrop-blur-md">
        <div className="bg-gradient-to-br from-brand-red to-brand-red-dark px-8 py-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-semibold uppercase tracking-[0.08em]">
            Campus de Capacitación
          </h1>
          <p className="mt-1 text-sm text-white/80">Ingreso de participantes</p>
        </div>

        <div className="p-8">
          <Link href="/capacitacion" className="flex justify-center">
            <BrandLogo size="lg" />
          </Link>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Número de DNI</label>
              <input
                required
                inputMode="numeric"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-brand-dark caret-brand-dark outline-none transition-colors placeholder:text-brand-gray-light focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
                placeholder="Ej: 30123456"
              />
            </div>
            {error && <p className="text-sm text-brand-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-red py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Ingresar al campus"}
            </button>
          </form>

          <Link
            href="/capacitacion"
            className="mt-6 block text-center text-sm text-white/50 transition-colors hover:text-brand-red"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
