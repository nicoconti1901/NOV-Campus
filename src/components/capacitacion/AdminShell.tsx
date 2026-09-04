"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bell, BookOpen, DoorOpen, Grid3x3, Home, LayoutDashboard, LogOut, Users } from "lucide-react";
import { BrandLogo } from "@/components/capacitacion/BrandLogo";
import { CampusFooter } from "@/components/capacitacion/CampusFooter";
import { CapacitacionBackground } from "@/components/capacitacion/CapacitacionBackground";
import { isAdminPublicPath, isCompanyRole, staffHomePath } from "@/lib/capacitacion/admin-access";

const NAV_LINKS = [
  { href: "/capacitacion/admin", label: "Panel", icon: LayoutDashboard, exact: true, trainerOnly: true },
  { href: "/capacitacion/admin/salas", label: "Salas", icon: DoorOpen, exact: false, trainerOnly: true },
  { href: "/capacitacion/admin/capacitaciones", label: "Capacitaciones", icon: BookOpen, exact: false, trainerOnly: true },
  { href: "/capacitacion/admin/matriz", label: "Matriz", icon: Grid3x3, exact: false, trainerOnly: true },
  { href: "/capacitacion/admin/progreso", label: "Progreso", icon: BarChart3, exact: false, trainerOnly: false },
  { href: "/capacitacion/admin/alumnos", label: "Alumnos y DNIs", icon: Users, exact: false, trainerOnly: true },
  { href: "/capacitacion/admin/alertas", label: "Alertas", icon: Bell, exact: false, trainerOnly: true },
];

type Props = {
  role: string | null;
  children: React.ReactNode;
};

function AdminNav({ role }: { role: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const company = isCompanyRole(role);
  const home = staffHomePath(role);
  const links = NAV_LINKS.filter((link) => (company ? !link.trainerOnly : true));

  async function logout() {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/capacitacion");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-navy/92 text-paper shadow-[0_12px_40px_-24px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-brand-red to-transparent" />
      <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={home} className="flex shrink-0 items-center gap-3 py-3">
          <BrandLogo size="md" />
          <div className="hidden lg:block">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-paper">
              NOV Campus
            </p>
            {company ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/90">
                Representante - Solo progreso
              </p>
            ) : null}
          </div>
        </Link>

        <div className="hidden h-6 w-px bg-paper/20 lg:block" />

        {company ? (
          <p className="flex-1 font-display text-sm font-semibold uppercase tracking-[0.12em] text-paper/80">
            Progreso del campus
          </p>
        ) : (
          <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto py-2">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-white text-ink shadow-sm" : "text-paper/70 hover:bg-white/10 hover:text-paper"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1 py-2">
          <Link
            href="/capacitacion"
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-paper/70 transition-colors hover:bg-white/10 hover:text-paper"
          >
            <Home className="h-4 w-4" />
            <span className="hidden md:inline">Inicio</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 px-2.5 py-2 text-sm font-medium text-paper/70 transition-colors hover:border-white hover:bg-white/10 hover:text-paper"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ role, children }: Props) {
  const pathname = usePathname();

  if (isAdminPublicPath(pathname)) {
    return <CapacitacionBackground>{children}</CapacitacionBackground>;
  }

  return (
    <div className="relative flex min-h-dvh flex-col text-ink">
      <AdminNav role={role} />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <CampusFooter />
    </div>
  );
}
