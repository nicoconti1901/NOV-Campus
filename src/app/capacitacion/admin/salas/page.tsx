import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { RoomsManager } from "@/components/capacitacion/RoomsManager";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

export default async function AdminSalasPage() {
  await requireAdminPage();

  return (
    <div>
      <CapacitacionSectionHeader
        title="Salas"
        subtitle="Crea, edita o elimina las salas tematicas del campus. Al borrar una sala tambien se eliminan sus capacitaciones."
      />
      <RoomsManager />
    </div>
  );
}
