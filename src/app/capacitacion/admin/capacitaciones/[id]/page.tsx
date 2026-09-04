import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { TrainingForm } from "@/components/capacitacion/TrainingForm";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

export const dynamic = "force-dynamic";

export default async function EditarCapacitacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  const [training, rooms, sedes, puestos, tareas] = await Promise.all([
    prisma.training.findUnique({
      where: { id },
      include: {
        materials: { orderBy: { sortOrder: "asc" } },
        questions: {
          orderBy: { sortOrder: "asc" },
          include: { options: true },
        },
        scopes: true,
      },
    }),
    prisma.room.findMany({ orderBy: { name: "asc" } }),
    prisma.sede.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.puesto.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.tarea.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!training) notFound();
  const scope = training.scopes[0];

  return (
    <div className="space-y-8">
      <CapacitacionSectionHeader title="Editar capacitacion" subtitle={training.title} />
      <TrainingForm
        rooms={rooms}
        directory={{ sedes, puestos, tareas }}
        initial={{
          id: training.id,
          title: training.title,
          description: training.description ?? "",
          coverImage: training.coverImage,
          roomId: training.roomId,
          minPassScore: training.minPassScore,
          published: training.published,
          validityDays: training.validityDays,
          sedeId: scope?.sedeId,
          puestoId: scope?.puestoId,
          tareaId: scope?.tareaId,
          materials: training.materials.map((m) => ({
            type: m.type as "video" | "file",
            title: m.title,
            fileUrl: m.fileUrl,
          })),
          questions: training.questions.map((q) => ({
            text: q.text,
            options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          })),
        }}
      />
    </div>
  );
}
