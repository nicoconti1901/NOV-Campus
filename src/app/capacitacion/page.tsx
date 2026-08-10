import Link from "next/link";
import { ArrowRight, GraduationCap, KeyRound, Shield } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { CampusHomeBackdrop } from "@/components/capacitacion/CampusHomeBackdrop";
import { CampusFooter } from "@/components/capacitacion/CampusFooter";
import { siteConfig } from "@/lib/data";

export default function CapacitacionPage() {
  const accessKey = process.env.CAMPUS_ACCESS_KEY?.trim();
  const studentLoginHref = accessKey ? `/capacitacion/${accessKey}` : null;

  return (
    <div className="relative flex min-h-screen flex-col">
      <CampusHomeBackdrop />

      <header className="border-b border-white/10 bg-brand-black/55 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/capacitacion" className="flex items-center gap-3">
            <BrandLogo size="md" priority />
            <div className="hidden sm:block">
              <p className="font-display text-lg font-semibold uppercase tracking-[0.14em] text-white">
                {siteConfig.name}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-orange">
                {siteConfig.tagline}
              </p>
            </div>
          </Link>
          <Link
            href="/capacitacion/admin/login"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-brand-black/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-brand-black/55 px-6 py-10 text-center shadow-2xl backdrop-blur-md animate-fade-up sm:px-10">
          <div className="mx-auto mb-8 inline-flex rounded-full shadow-[0_0_40px_rgba(255,140,0,0.2)] ring-2 ring-brand-orange/40">
            <BrandLogo size="xl" priority />
          </div>

          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-brand-orange">
            Acceso privado
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase tracking-[0.06em] text-white sm:text-5xl">
            {siteConfig.name}
          </h1>
          <p className="mt-2 font-display text-xl uppercase tracking-[0.18em] text-white/80">
            {siteConfig.tagline}
          </p>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/75">
            Ingresá con tu enlace de participante o con la cuenta de administración para gestionar
            capacitaciones, salas y certificaciones.
          </p>
        </div>

        <div
          className="mx-auto mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {studentLoginHref ? (
            <Link
              href={studentLoginHref}
              className="group flex flex-col rounded-2xl border border-white/10 bg-brand-black/60 p-7 shadow-xl backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-orange/50 hover:bg-brand-black/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange text-brand-black">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-lg font-semibold uppercase tracking-[0.1em] text-white">
                Ingreso participantes
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">
                Accedé con tu DNI habilitado para ver materiales, rendir evaluaciones y descargar certificados.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
                Ingresar al campus
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ) : (
            <div className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-brand-black/50 p-7 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 text-white/70">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-lg font-semibold uppercase tracking-[0.1em] text-white">
                Enlace privado
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Los participantes ingresan con el enlace privado que les entrega la administración.
              </p>
            </div>
          )}

          <Link
            href="/capacitacion/admin/login"
            className="group flex flex-col rounded-2xl border border-white/10 bg-brand-black/60 p-7 shadow-xl backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-orange/50 hover:bg-brand-black/70"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-black">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-lg font-semibold uppercase tracking-[0.1em] text-white">
              Administración
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">
              Gestioná salas, capacitaciones, DNIs habilitados y el progreso de los participantes.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
              Ir al panel
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </main>

      <CampusFooter />
    </div>
  );
}
