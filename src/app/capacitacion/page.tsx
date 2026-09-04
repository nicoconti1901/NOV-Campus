import Link from "next/link";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { CampusFooter } from "@/components/capacitacion/CampusFooter";
import { CampusGate } from "@/components/capacitacion/CampusGate";
import { siteConfig } from "@/lib/data";

export default function CapacitacionPage() {
  const accessKey = process.env.CAMPUS_ACCESS_KEY?.trim();
  const studentLoginHref = accessKey ? `/capacitacion/${accessKey}` : null;

  return (
    <div className="relative flex min-h-dvh flex-col text-ink">
      <header className="shrink-0 border-b border-white/10 bg-brand-navy/92 text-paper backdrop-blur-xl">
        <div className="h-0.5 w-full bg-linear-to-r from-transparent via-brand-red to-transparent" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/capacitacion" className="shrink-0">
            <BrandLogo size="md" priority />
          </Link>
          <p className="hidden font-display text-sm font-semibold uppercase tracking-[0.12em] text-paper/80 sm:block">
            {siteConfig.tagline}
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <CampusGate studentLoginHref={studentLoginHref} />
      </main>

      <CampusFooter />
    </div>
  );
}
