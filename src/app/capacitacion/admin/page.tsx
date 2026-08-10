import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { AdminRoomCard } from "@/components/capacitacion/AdminRoomCard";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

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
      accent: "from-brand-red to-brand-red-dark",
    },
    {
      label: "Alumnos registrados",
      value: students,
      hint: "Con perfil completo",
      href: "/capacitacion/admin/alumnos",
      accent: "from-sky-600 to-blue-700",
    },
    {
      label: "DNIs habilitados",
      value: dnis,
      hint: "Acceso al campus",
      href: "/capacitacion/admin/alumnos",
      accent: "from-emerald-600 to-teal-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-white/90 shadow-xl ring-1 ring-white/60 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-brand-red to-brand-red-dark p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Administración
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Panel general</h2>
          <p className="mt-2 max-w-xl text-white/85">
            Resumen de la Plataforma de Capacitación. Gestioná cursos, accesos y el progreso de los participantes.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          {stats.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r ${item.accent}`} />
              <p className="text-sm text-brand-gray">{item.label}</p>
              <p className="mt-1 text-3xl font-bold text-brand-dark">{item.value}</p>
              <p className="mt-1 text-xs text-brand-gray-light">{item.hint}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <CapacitacionSectionHeader
          title="Salas de capacitación"
          subtitle="Accedé al contenido de cada área temática"
          actions={
            <>
              <Link
                href="/capacitacion/admin/capacitaciones/nueva"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-red-dark"
              >
                <Plus className="h-4 w-4" />
                Nueva capacitación
              </Link>
              <Link
                href="/capacitacion/admin/alumnos"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-sm hover:bg-brand-gray-bg"
              >
                <Users className="h-4 w-4" />
                Gestionar alumnos
              </Link>
            </>
          }
        />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <AdminRoomCard
              key={room.id}
              slug={room.slug}
              name={room.name}
              trainingCount={room._count.trainings}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
