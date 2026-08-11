import Link from "next/link";
import { ArrowUpRight, GraduationCap, KeyRound, Presentation } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { CampusHomeBackdrop } from "@/components/capacitacion/CampusHomeBackdrop";
import { EducatorMascot } from "@/components/capacitacion/EducatorMascot";
import { siteConfig } from "@/lib/data";

export default function CapacitacionPage() {
  const accessKey = process.env.CAMPUS_ACCESS_KEY?.trim();
  const studentLoginHref = accessKey ? `/capacitacion/${accessKey}` : null;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <CampusHomeBackdrop />

      <header className="shrink-0 border-b border-white/10 bg-brand-black/55 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/capacitacion" className="flex items-center gap-3">
            <BrandLogo size="sm" priority />
            <div className="hidden sm:block">
              <p className="font-display text-base font-semibold uppercase tracking-[0.14em] text-white">
                {siteConfig.name}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-orange">
                {siteConfig.tagline}
              </p>
            </div>
          </Link>
          <Link
            href="/capacitacion/admin/login"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-brand-black/40 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            <Presentation className="h-4 w-4" />
            Capacitadores
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-4 sm:py-6">
        <section className="grid w-full animate-fade-up overflow-hidden rounded-3xl border border-white/10 bg-brand-black/60 shadow-2xl backdrop-blur-md lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col items-center justify-center gap-3 border-b border-white/10 px-6 py-6 text-center sm:px-8 lg:border-b-0 lg:border-r lg:py-8">
            <EducatorMascot className="w-[100px] sm:w-[140px] [@media(max-height:740px)]:w-[88px]" />
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-orange">
              Acceso privado
            </p>
            <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.06em] text-white sm:text-4xl">
              {siteConfig.name}
            </h1>
            <p className="font-display text-sm uppercase tracking-[0.16em] text-white/70">
              {siteConfig.tagline}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-white/65">
              Capacitaciones, evaluaciones y certificados en un solo campus.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 p-4 sm:gap-4 sm:p-6">
            <p className="px-1 font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
              Elegí tu módulo
            </p>

            {studentLoginHref ? (
              <Link
                href={studentLoginHref}
                className="group relative overflow-hidden rounded-2xl border border-brand-orange/25 bg-gradient-to-br from-brand-orange/15 via-brand-orange/5 to-transparent p-5 transition-all hover:border-brand-orange/55 hover:from-brand-orange/25"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-orange/20 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-brand-black shadow-lg shadow-brand-orange/25">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-orange">
                        Módulo 01
                      </p>
                      <h2 className="mt-1 font-display text-xl font-semibold uppercase tracking-[0.08em] text-white">
                        Alumnos
                      </h2>
                      <p className="mt-2 max-w-[16rem] text-sm leading-snug text-white/65">
                        Material, evaluaciones y certificados con tu DNI.
                      </p>
                    </div>
                  </div>
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-orange/40 text-brand-orange transition-all group-hover:bg-brand-orange group-hover:text-brand-black">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 text-white/70">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      Módulo 01
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold uppercase tracking-[0.08em] text-white">
                      Alumnos
                    </h2>
                    <p className="mt-2 text-sm leading-snug text-white/60">
                      Usá el enlace privado que te enviaron los capacitadores.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/capacitacion/admin/login"
              className="group relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/20 via-amber-500/8 to-transparent p-5 transition-all hover:border-amber-300/60 hover:from-amber-400/30"
            >
              <div className="pointer-events-none absolute -right-8 top-0 h-28 w-28 rounded-full bg-amber-400/25 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-32 bg-gradient-to-tr from-amber-500/10 to-transparent" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-brand-black shadow-lg shadow-amber-500/30">
                    <Presentation className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Módulo 02
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold uppercase tracking-[0.08em] text-white">
                      Capacitadores
                    </h2>
                    <p className="mt-2 max-w-[16rem] text-sm leading-snug text-white/65">
                      Salas, cursos, DNIs habilitados y seguimiento.
                    </p>
                  </div>
                </div>
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/45 text-amber-300 transition-all group-hover:bg-amber-400 group-hover:text-brand-black">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <footer className="shrink-0 border-t border-white/10 bg-brand-black/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-white/55">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p>Los juegos de azar no están permitidos para menores de 18 años.</p>
        </div>
      </footer>
    </div>
  );
}
