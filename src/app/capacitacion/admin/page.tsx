import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Plus, ShieldCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { AdminRoomCard } from "@/components/capacitacion/AdminRoomCard";

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const [trainings, students, dnis, rooms, published] = await Promise.all([
    prisma.training.count(),
    prisma.student.count({ where: { profileCompleted: true } }),
    prisma.allowedDni.count({ where: { enabled: true } }),
    prisma.room.findMany({
      include: { _count: { select: { trainings: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.training.count({ where: { published: true } }),
  ]);

  const stats = [
    {
      label: "Capacitaciones",
      value: trainings,
      hint: `${published} publicadas`,
      href: "/capacitacion/admin/capacitaciones",
      icon: BookOpen,
      fill: "bg-rose-50",
      ring: "ring-rose-200 hover:ring-rose-300",
      iconBox: "bg-brand-red text-white",
      number: "text-rose-800",
      bar: "from-brand-red to-rose-600",
    },
    {
      label: "Personal registrado",
      value: students,
      hint: "Con perfil completo",
      href: "/capacitacion/admin/alumnos",
      icon: Users,
      fill: "bg-sky-50",
      ring: "ring-sky-200 hover:ring-sky-300",
      iconBox: "bg-sky-600 text-white",
      number: "text-sky-800",
      bar: "from-sky-500 to-blue-600",
    },
    {
      label: "DNIs habilitados",
      value: dnis,
      hint: "Acceso al campus",
      href: "/capacitacion/admin/alumnos",
      icon: ShieldCheck,
      fill: "bg-emerald-50",
      ring: "ring-emerald-200 hover:ring-emerald-300",
      iconBox: "bg-emerald-600 text-white",
      number: "text-emerald-800",
      bar: "from-emerald-400 to-teal-500",
    },
    {
      label: "Salas activas",
      value: rooms.length,
      hint: "Areas tematicas",
      href: "/capacitacion/admin/salas",
      icon: BarChart3,
      fill: "bg-amber-50",
      ring: "ring-amber-200 hover:ring-amber-300",
      iconBox: "bg-amber-500 text-white",
      number: "text-amber-800",
      bar: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div className="space-y-10">

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 p-8 ring-1 ring-slate-200/80 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-10">
        <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-navy via-brand-red to-teal-500" />
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(196,45,38,0.12), transparent 65%)," +
              "radial-gradient(ellipse 40% 60% at 0% 100%, rgba(14,165,233,0.1), transparent 55%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Panel de capacitadores
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Gestioná salas, cursos, accesos y el progreso del personal. Todo el sistema de capacitación HSE en un solo panel.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/capacitacion/admin/capacitaciones/nueva"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
            >
              <Plus className="h-4 w-4" />
              Nueva capacitación
            </Link>
            <Link
              href="/capacitacion/admin/matriz"
              className="inline-flex items-center gap-2 rounded-xl border border-rule px-5 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink"
            >
              Ver matriz
            </Link>
            <Link
              href="/capacitacion/admin/progreso"
              className="inline-flex items-center gap-2 rounded-xl border border-rule px-5 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink"
            >
              <BarChart3 className="h-4 w-4" />
              Ver progreso
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section data-tour="admin-stats">
        <p className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
          Resumen general
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative overflow-hidden rounded-2xl p-5 ring-1 backdrop-blur-sm transition-all hover:-translate-y-1 ${item.fill} ${item.ring}`}
            >
              <span className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${item.bar}`} />
              <div className="mb-4 flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBox}`}>
                  <item.icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">{item.label}</p>
              <p className={`mt-1 font-display text-3xl font-semibold ${item.number}`}>{item.value}</p>
              <p className="mt-1 text-xs text-ink-muted">{item.hint}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Salas */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold uppercase tracking-[0.06em] text-ink">
              Salas de capacitación
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Cada sala agrupa cursos por área temática. Hacé clic para gestionar su contenido.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/capacitacion/admin/salas"
              className="inline-flex items-center gap-2 rounded-xl border border-rule px-4 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink"
            >
              Gestionar salas
            </Link>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rule bg-paper-muted p-12 text-center">
            <p className="text-sm text-ink-muted">No hay salas creadas todavía.</p>
            <Link
              href="/capacitacion/admin/salas"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
            >
              <Plus className="h-4 w-4" />
              Crear primera sala
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {rooms.map((room) => (
              <AdminRoomCard
                key={room.id}
                slug={room.slug}
                name={room.name}
                trainingCount={room._count.trainings}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
