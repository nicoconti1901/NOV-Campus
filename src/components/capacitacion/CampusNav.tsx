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
    <header className="border-b border-white/10 bg-brand-black/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/capacitacion" className="shrink-0">
            <BrandLogo size="md" />
          </Link>
          <div className="hidden h-8 w-px bg-white/15 sm:block" />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">
              {subtitle}
            </p>
            <Link
              href={titleHref}
              className="truncate font-display text-base font-semibold uppercase tracking-[0.06em] text-white sm:text-lg"
            >
              {title}
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {showCertificates && (
            <Link
              href="/capacitacion/campus/certificados"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-brand-red hover:text-white sm:px-3"
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Mis certificados</span>
            </Link>
          )}
          <Link
            href="/capacitacion"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-brand-red hover:text-white sm:px-3"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:border-brand-red hover:bg-brand-red hover:text-white sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
