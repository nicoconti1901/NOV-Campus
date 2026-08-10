import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentPage } from "@/lib/capacitacion/auth-guards";
import { getRoomTheme } from "@/lib/capacitacion/rooms";
import { TrainingCard } from "@/components/capacitacion/TrainingCard";

export default async function SalaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireStudentPage();
  const { slug } = await params;

  const student = await prisma.student.findUnique({ where: { id: session.studentId } });
  if (!student?.profileCompleted) redirect("/capacitacion/campus/perfil");

  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      trainings: {
        where: { published: true },
        include: { progress: { where: { studentId: session.studentId } } },
        orderBy: { title: "asc" },
      },
    },
  });

  if (!room) notFound();

  const theme = getRoomTheme(slug);
  const Icon = theme.icon;

  return (
    <div>
      <Link
        href="/capacitacion/campus"
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium text-brand-gray shadow-sm ring-1 ring-white/60 backdrop-blur-sm transition-colors hover:text-brand-red"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a salas
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white/90 shadow-xl ring-1 ring-white/60 backdrop-blur-sm">
        <div className="relative h-44 sm:h-52">
          <Image
            src={theme.coverImage}
            alt={room.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.overlay}`} />
          <div className="absolute inset-0 flex items-end p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Sala temática</p>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">{room.name}</h2>
                <p className="mt-1 text-sm text-white/85">
                  {room.trainings.length} capacitación{room.trainings.length !== 1 ? "es" : ""} disponible
                  {room.trainings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          {room.trainings.length === 0 ? (
            <div className="rounded-2xl bg-brand-gray-bg/50 p-8 text-center">
              <p className="text-brand-gray">No hay capacitaciones publicadas en esta sala.</p>
            </div>
          ) : (
            room.trainings.map((t) => {
              const progress = t.progress[0];
              return (
                <TrainingCard
                  key={t.id}
                  id={t.id}
                  title={t.title}
                  description={t.description}
                  coverImage={t.coverImage}
                  status={progress?.status ?? "not_started"}
                  score={progress?.score}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
