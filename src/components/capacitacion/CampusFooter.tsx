import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { siteConfig } from "@/lib/data";

const footerLinks = [
  { href: "/capacitacion", label: "Campus" },
  { href: "/capacitacion/admin/login", label: "Administración" },
  { href: `mailto:${siteConfig.email}`, label: "Contacto" },
];

export function CampusFooter() {
  return (
    <footer className="mt-auto bg-brand-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/capacitacion" className="shrink-0">
            <BrandLogo size="lg" />
          </Link>

          <nav className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-10 sm:gap-y-2">
            {footerLinks.map((link) =>
              link.href.startsWith("mailto:") ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </div>

      <div className="bg-brand-black">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <p className="text-center text-xs text-white/80">
            Los juegos de azar no están permitidos para menores de 18 años.
          </p>

          <div className="mt-5 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-white/90">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-sm font-bold">
                +18
              </span>
              <span className="max-w-[10rem] leading-tight">Jugá responsable · Seguro · Legal</span>
            </div>

            <p className="text-center text-xs text-white/60">
              © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.tagline}.
            </p>

            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Linkedin].map((Icon, index) => (
                <span
                  key={index}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white/80"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
