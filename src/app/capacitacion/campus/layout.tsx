"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, GraduationCap } from "lucide-react";
import { CampusFooter } from "@/components/capacitacion/CampusFooter";
import { CampusNav } from "@/components/capacitacion/CampusNav";

const NAV_LINKS = [
  { href: "/capacitacion/campus", label: "Inicio", icon: GraduationCap, exact: true },
  { href: "/capacitacion/campus/alertas", label: "Alertas", icon: Bell, exact: false },
];

export default function CampusLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTrainingView = pathname.startsWith("/capacitacion/campus/capacitacion/");

  return (
    <div className="relative flex min-h-dvh flex-col text-ink">
      <CampusNav
        subtitle="Capacitación obligatoria"
        title="NOV Campus"
        logoutEndpoint="/api/auth/student/logout"
        showCertificates
      />
      {!isTrainingView && (
        <nav className="border-b border-white/60 bg-white/55 backdrop-blur-xl">
          <div className="mx-auto flex max-w-screen-2xl gap-1 px-4 sm:px-6 lg:px-8">
            {NAV_LINKS.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-t-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white text-brand-red shadow-[0_-8px_24px_-16px_rgba(196,45,38,0.45)]"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <CampusFooter />
    </div>
  );
}
