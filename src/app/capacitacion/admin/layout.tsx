"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, DoorOpen, LayoutDashboard, Users } from "lucide-react";
import { CapacitacionBackground } from "@/components/capacitacion/CapacitacionBackground";
import { CampusNav } from "@/components/capacitacion/CampusNav";

const links = [
  { href: "/capacitacion/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/capacitacion/admin/salas", label: "Salas", icon: DoorOpen },
  { href: "/capacitacion/admin/capacitaciones", label: "Capacitaciones", icon: BookOpen },
  { href: "/capacitacion/admin/alumnos", label: "Alumnos y DNIs", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/capacitacion/admin/login") {
    return <CapacitacionBackground>{children}</CapacitacionBackground>;
  }

  return (
    <CapacitacionBackground>
      <CampusNav
        subtitle="Capacitadores"
        title="NOV Campus"
        titleHref="/capacitacion/admin"
        logoutEndpoint="/api/auth/admin/logout"
      />
      <nav className="border-b border-white/40 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {links.map((link) => {
            const active =
              link.href === "/capacitacion/admin"
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-red text-white shadow-sm"
                    : "text-brand-gray hover:bg-white/80"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </CapacitacionBackground>
  );
}
