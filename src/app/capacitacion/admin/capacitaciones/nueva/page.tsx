import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { TrainingForm } from "@/components/capacitacion/TrainingForm";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

export default async function NuevaCapacitacionPage() {
  await requireAdminPage();
  const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <CapacitacionSectionHeader
        title="Nueva capacitación"
        subtitle="Cargá material didáctico y la evaluación"
      />
      <div className="mt-2">
        <TrainingForm rooms={rooms} />
      </div>
    </div>
  );
}
