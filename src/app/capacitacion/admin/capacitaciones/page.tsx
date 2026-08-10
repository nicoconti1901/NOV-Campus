import Link from "next/link";
import Image from "next/image";
import { BookOpen, Pencil, Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { getRoomTheme } from "@/lib/capacitacion/rooms";
import { AdminRoomCard } from "@/components/capacitacion/AdminRoomCard";
import { DeleteTrainingButton } from "@/components/capacitacion/DeleteTrainingButton";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

export const dynamic = "force-dynamic";

export default async function AdminTrainingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sala?: string }>;
}) {
  await requireAdminPage();
  const { sala } = await searchParams;

  const rooms = await prisma.room.findMany({
    include: {
      trainings: {
        include: {
          _count: { select: { progress: true } },
          progress: { select: { status: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const filteredRooms = sala ? rooms.filter((r) => r.slug === sala) : rooms;
  const totalTrainings = rooms.reduce((acc, r) => acc + r.trainings.length, 0);

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-white/95 shadow-xl ring-1 ring-white/70 backdrop-blur-sm">
        <div className="flex flex-wrap items-end justify-between gap-4 bg-gradient-to-br from-brand-red to-brand-red-dark px-6 py-7 text-white sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Contenido
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Capacitaciones</h2>
            <p className="mt-1 text-sm text-white/85">
              {totalTrainings} curso{totalTrainings !== 1 ? "s" : ""} en {rooms.length} salas
              {!sala && totalTrainings > 0
                ? " — mirá el listado por sala más abajo (o filtrá con las cards)"
                : ""}
            </p>
          </div>
          <Link
            href="/capacitacion/admin/capacitaciones/nueva"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-red shadow-sm hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Nueva capacitación
          </Link>
        </div>
      </div>

      <div>
        <CapacitacionSectionHeader
          title="Salas temáticas"
          subtitle={
            sala
              ? "Filtrado por sala seleccionada"
              : "Seleccioná una sala para filtrar, o mirá todas abajo"
          }
          actions={
            sala ? (
              <Link
                href="/capacitacion/admin/capacitaciones"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-gray-bg"
              >
                Ver todas las salas
              </Link>
            ) : undefined
          }
        />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <AdminRoomCard
              key={room.id}
              slug={room.slug}
              name={room.name}
              trainingCount={room.trainings.length}
              href={`/capacitacion/admin/capacitaciones?sala=${room.slug}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {filteredRooms.map((room) => {
          const theme = getRoomTheme(room.slug);
          const Icon = theme.icon;
          const completed = room.trainings.reduce(
            (acc, t) =>
              acc + t.progress.filter((p) => p.status === PROGRESS_STATUS.COMPLETED).length,
            0
          );
          const inProgress = room.trainings.reduce(
            (acc, t) =>
              acc + t.progress.filter((p) => p.status === PROGRESS_STATUS.IN_PROGRESS).length,
            0
          );
          const totalProgress = room.trainings.reduce((acc, t) => acc + t.progress.length, 0);

          return (
            <section
              key={room.id}
              className="overflow-hidden rounded-3xl bg-white/95 shadow-xl ring-1 ring-white/70 backdrop-blur-sm"
            >
              <div className="relative h-36 sm:h-40">
                <Image
                  src={theme.coverImage}
                  alt={room.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1152px"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${theme.overlay}`} />
                <div className="absolute inset-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white sm:text-2xl">{room.name}</h3>
                      <p className="text-sm text-white/80">
                        {room.trainings.length} capacitación
                        {room.trainings.length !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                  {totalProgress > 0 && (
                    <div className="hidden rounded-2xl border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:block">
                      <p>{completed} aprobados · {inProgress} en curso</p>
                      <p className="mt-0.5 text-white/75">{totalProgress} registros de progreso</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {room.trainings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-8 text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-brand-gray-light" />
                    <p className="mt-2 text-sm text-brand-gray">
                      Todavía no hay capacitaciones en esta sala.
                    </p>
                    <Link
                      href="/capacitacion/admin/capacitaciones/nueva"
                      className="mt-3 inline-flex text-sm font-semibold text-brand-red hover:underline"
                    >
                      Crear capacitación
                    </Link>
                  </div>
                ) : (
                  room.trainings.map((t) => {
                    const done = t.progress.filter(
                      (p) => p.status === PROGRESS_STATUS.COMPLETED
                    ).length;
                    const active = t.progress.filter(
                      (p) => p.status === PROGRESS_STATUS.IN_PROGRESS
                    ).length;
                    const failed = t.progress.filter(
                      (p) => p.status === PROGRESS_STATUS.FAILED
                    ).length;
                    const total = t.progress.length;
                    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

                    return (
                      <div
                        key={t.id}
                        className="rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-brand-gray-bg/40 p-5 transition-all hover:border-brand-red/20 hover:shadow-md"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/capacitacion/admin/capacitaciones/${t.id}`}
                                className="text-lg font-bold text-brand-dark hover:text-brand-red"
                              >
                                {t.title}
                              </Link>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                                  t.published
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                    : "bg-gray-100 text-gray-600 ring-gray-200"
                                }`}
                              >
                                {t.published ? "Publicada" : "Borrador"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-brand-gray">
                              Aprobación mínima: {t.minPassScore}%
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/capacitacion/admin/capacitaciones/${t.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-brand-dark hover:border-brand-red/30 hover:text-brand-red"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Link>
                            <DeleteTrainingButton trainingId={t.id} title={t.title} />
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-gray">
                              <Users className="h-4 w-4" />
                              {total}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-medium text-brand-gray">Progreso de alumnos</span>
                            <span className="font-bold text-brand-dark">
                              {total > 0 ? `${completionPct}% aprobados` : "Sin actividad"}
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                            {total > 0 ? (
                              <div className="flex h-full w-full">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                  style={{ width: `${(done / total) * 100}%` }}
                                  title={`${done} aprobados`}
                                />
                                <div
                                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                                  style={{ width: `${(active / total) * 100}%` }}
                                  title={`${active} en progreso`}
                                />
                                <div
                                  className="h-full bg-gradient-to-r from-red-400 to-brand-red"
                                  style={{ width: `${(failed / total) * 100}%` }}
                                  title={`${failed} no aprobados`}
                                />
                              </div>
                            ) : (
                              <div className="h-full w-full bg-gray-200/70" />
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-brand-gray">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              {done} aprobados
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                              {active} en progreso
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-brand-red" />
                              {failed} no aprobados
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
