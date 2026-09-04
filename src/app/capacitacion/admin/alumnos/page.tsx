import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { AlumnosManager } from "@/components/capacitacion/AlumnosManager";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

export default async function AdminAlumnosPage() {
  await requireAdminPage();

  return (
    <div className="space-y-8">
      <CapacitacionSectionHeader
        title="Alumnos y DNIs"
        subtitle="Habilita documentos, busca por apellido o DNI y consulta el progreso de cada participante."
      />
      <AlumnosManager />
    </div>
  );
}
