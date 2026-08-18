import Link from "next/link";
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
                  className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-red transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-red transition-colors hover:text-white"
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
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-center text-xs text-white/60">
              © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.tagline}.
            </p>
            <p className="text-center text-xs text-white/45">{siteConfig.location}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
