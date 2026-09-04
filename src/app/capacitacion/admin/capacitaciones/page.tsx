import Link from "next/link";
import Image from "next/image";
import { BookOpen, Pencil, Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { getRoomTheme } from "@/lib/capacitacion/rooms";
import { AdminRoomCard } from "@/components/capacitacion/AdminRoomCard";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";
import { DeleteTrainingButton } from "@/components/capacitacion/DeleteTrainingButton";

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
      <CapacitacionSectionHeader
        title="Capacitaciones"
        subtitle={`${totalTrainings} curso${totalTrainings !== 1 ? "s" : ""} en ${rooms.length} salas`}
        actions={
          <Link
            href="/capacitacion/admin/capacitaciones/nueva"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
          >
            <Plus className="h-4 w-4" />
            Nueva capacitacion
          </Link>
        }
      />

      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Organización
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold uppercase tracking-[0.06em] text-ink">
              Salas temáticas
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {sala
                ? "Filtrado por sala seleccionada"
                : "Seleccioná una sala para filtrar, o mirá todas abajo"}
            </p>
          </div>
          {sala ? (
            <Link
              href="/capacitacion/admin/capacitaciones"
              className="rounded-xl border border-rule bg-paper-muted px-4 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink"
            >
              Ver todas las salas
            </Link>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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

      <div className="space-y-5">
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
              className="overflow-hidden rounded-3xl border border-rule bg-paper-raised"
            >
              <div className="relative h-36 sm:h-40">
                <Image
                  src={theme.coverImage}
                  alt={room.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1152px"
                />
                <div className={`absolute inset-0 bg-linear-to-t ${theme.overlay}`} />
                <div className="absolute inset-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rule bg-black/35">
                      <Icon className="h-6 w-6 text-ink" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold uppercase tracking-[0.04em] text-ink sm:text-xl">
                        {room.name}
                      </h3>
                      <p className="text-sm text-ink-muted">
                        {room.trainings.length} capacitación
                        {room.trainings.length !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                  {totalProgress > 0 && (
                    <div className="hidden rounded-2xl border border-rule bg-black/35 px-4 py-2 text-xs font-semibold text-ink sm:block">
                      <p>
                        {completed} aprobados · {inProgress} en curso
                      </p>
                      <p className="mt-0.5 text-ink-muted">{totalProgress} registros de progreso</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {room.trainings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-rule px-5 py-8 text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-ink-muted" />
                    <p className="mt-2 text-sm text-ink-muted">
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
                        className="rounded-2xl border border-rule bg-paper-muted p-5 transition-colors hover:border-white/18 hover:bg-paper-muted"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/capacitacion/admin/capacitaciones/${t.id}`}
                                className="text-lg font-semibold text-ink hover:text-brand-red"
                              >
                                {t.title}
                              </Link>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${ t.published ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25" : "bg-paper-muted text-ink-muted ring-white/12" }`}
                              >
                                {t.published ? "Publicada" : "Borrador"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-ink-muted">
                              Aprobación mínima: {t.minPassScore}%
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/capacitacion/admin/capacitaciones/${t.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper-muted px-3 py-2 text-xs font-semibold text-ink-muted hover:bg-paper-muted hover:text-ink"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Link>
                            <DeleteTrainingButton trainingId={t.id} title={t.title} />
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                              <Users className="h-4 w-4" />
                              {total}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-medium text-ink-muted">Progreso de alumnos</span>
                            <span className="font-semibold text-ink-muted">
                              {total > 0 ? `${completionPct}% aprobados` : "Sin actividad"}
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                            {total > 0 ? (
                              <div className="flex h-full w-full">
                                <div
                                  className="h-full bg-emerald-500/80"
                                  style={{ width: `${(done / total) * 100}%` }}
                                  title={`${done} aprobados`}
                                />
                                <div
                                  className="h-full bg-amber-400/80"
                                  style={{ width: `${(active / total) * 100}%` }}
                                  title={`${active} en progreso`}
                                />
                                <div
                                  className="h-full bg-brand-red-dark"
                                  style={{ width: `${(failed / total) * 100}%` }}
                                  title={`${failed} no aprobados`}
                                />
                              </div>
                            ) : (
                              <div className="h-full w-full bg-paper-muted" />
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                              {done} aprobados
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                              {active} en progreso
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-brand-red-dark" />
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
