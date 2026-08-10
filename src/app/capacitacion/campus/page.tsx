import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentPage } from "@/lib/capacitacion/auth-guards";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { RoomCard } from "@/components/capacitacion/RoomCard";

export default async function CampusPage() {
  const session = await requireStudentPage();

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
  });

  if (!student?.profileCompleted) {
    redirect("/capacitacion/campus/perfil");
  }

  const rooms = await prisma.room.findMany({
    include: {
      trainings: {
        where: { published: true },
        include: {
          progress: { where: { studentId: session.studentId } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalCompleted = rooms.reduce(
    (acc, room) =>
      acc +
      room.trainings.filter((t) => t.progress[0]?.status === PROGRESS_STATUS.COMPLETED).length,
    0
  );

  return (
    <div>
      <div className="overflow-hidden rounded-3xl bg-white/90 shadow-xl ring-1 ring-white/60 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-brand-red to-brand-red-dark p-6 text-white sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Campus virtual</p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Hola, {student.firstName}</h2>
              <p className="mt-2 max-w-xl text-white/85">
                Seleccioná una sala temática para acceder a tus capacitaciones.
                {totalCompleted > 0 &&
                  ` Llevás ${totalCompleted} curso${totalCompleted !== 1 ? "s" : ""} aprobado${totalCompleted !== 1 ? "s" : ""}.`}
              </p>
              {totalCompleted > 0 && (
                <Link
                  href="/capacitacion/campus/certificados"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
                >
                  <Award className="h-4 w-4" />
                  Ver mis certificados
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-bold text-brand-dark">Salas de capacitación</h3>
          <p className="mt-1 text-sm text-brand-gray">
            Cada sala agrupa cursos por área de especialización
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                slug={room.slug}
                name={room.name}
                trainingCount={room.trainings.length}
                completedCount={
                  room.trainings.filter((t) => t.progress[0]?.status === PROGRESS_STATUS.COMPLETED)
                    .length
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
