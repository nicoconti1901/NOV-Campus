"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Home, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";

type Props = {
  subtitle: string;
  title: string;
  titleHref?: string;
  logoutEndpoint: string;
  showCertificates?: boolean;
};

export function CampusNav({
  subtitle,
  title,
  titleHref = "/capacitacion/campus",
  logoutEndpoint,
  showCertificates = false,
}: Props) {
  const router = useRouter();

  async function logout() {
    await fetch(logoutEndpoint, { method: "POST" });
    router.push("/capacitacion");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-navy/92 text-paper shadow-[0_12px_40px_-24px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-brand-red to-transparent" />
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/capacitacion" className="shrink-0">
            <BrandLogo size="md" priority />
          </Link>
          <div className="hidden h-8 w-px bg-paper/20 sm:block" />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-semibold uppercase tracking-[0.08em] text-paper sm:text-lg">
              <Link href={titleHref}>{title}</Link>
            </p>
            <p className="truncate text-[11px] text-paper/65">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {showCertificates && (
            <Link
              href="/capacitacion/campus/certificados"
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-paper/80 transition-colors hover:bg-white/10 hover:text-paper sm:px-3"
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Mis certificados</span>
            </Link>
          )}
          <Link
            href="/capacitacion"
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-paper/80 transition-colors hover:bg-white/10 hover:text-paper sm:px-3"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-2.5 py-2 text-sm font-medium text-paper/80 transition-colors hover:border-white hover:bg-white/10 hover:text-paper sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
