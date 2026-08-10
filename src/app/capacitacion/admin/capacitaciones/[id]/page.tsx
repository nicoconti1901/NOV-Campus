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

  const [training, rooms] = await Promise.all([
    prisma.training.findUnique({
      where: { id },
      include: {
        materials: { orderBy: { sortOrder: "asc" } },
        questions: {
          orderBy: { sortOrder: "asc" },
          include: { options: true },
        },
      },
    }),
    prisma.room.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!training) notFound();

  return (
    <div>
      <CapacitacionSectionHeader title="Editar capacitación" subtitle={training.title} />
      <div className="mt-2">
        <TrainingForm
          rooms={rooms}
          initial={{
            id: training.id,
            title: training.title,
            description: training.description ?? "",
            coverImage: training.coverImage,
            roomId: training.roomId,
            minPassScore: training.minPassScore,
            published: training.published,
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
    </div>
  );
}
