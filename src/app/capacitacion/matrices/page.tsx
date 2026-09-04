import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { CapacitacionBackground } from "@/components/capacitacion/CapacitacionBackground";
import { CompetencyMatrixDashboard } from "@/components/capacitacion/CompetencyMatrixDashboard";
import { siteConfig } from "@/lib/data";

export default function MatricesPage() {
  return (
    <CapacitacionBackground>
      <header className="border-b border-white/10 bg-brand-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/capacitacion" className="flex min-w-0 items-center gap-3">
            <BrandLogo size="md" />
            <div>
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a227]">
                Módulo 03 · Matriz ISO
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">{siteConfig.tagline}</p>
            </div>
          </Link>
          <Link href="/capacitacion" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CompetencyMatrixDashboard />
      </main>
    </CapacitacionBackground>
  );
}
