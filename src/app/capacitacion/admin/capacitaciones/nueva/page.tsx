import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { TrainingForm } from "@/components/capacitacion/TrainingForm";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

export default async function NuevaCapacitacionPage() {
  await requireAdminPage();
  const [rooms, sedes, puestos, tareas] = await Promise.all([
    prisma.room.findMany({ orderBy: { name: "asc" } }),
    prisma.sede.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.puesto.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.tarea.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <CapacitacionSectionHeader
        title="Nueva capacitacion"
        subtitle="Carga material, evaluacion y el alcance obligatorio (sector, puesto y tarea)."
      />
      <TrainingForm rooms={rooms} directory={{ sedes, puestos, tareas }} />
    </div>
  );
}
