import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { ensureCatalogCellsOnPublishedMatrix } from "@/lib/capacitacion/matrix-service";
import { MatrixManager } from "@/components/capacitacion/MatrixManager";
import { CapacitacionSectionHeader } from "@/components/capacitacion/CapacitacionSectionHeader";

export const dynamic = "force-dynamic";

export default async function AdminMatrixPage() {
  await requireAdminPage();
  // Sin sync masivo de alumnos en el GET (eso bloqueaba la página por minutos).
  await ensureCatalogCellsOnPublishedMatrix({ syncStudents: false });

  return (
    <div className="space-y-8">
      <CapacitacionSectionHeader
        title="Celdas de capacitacion"
        subtitle="La persona no se anota. Cada tema vive en una celda puesto x tarea x sede y se materializa por alumno."
      />
      <MatrixManager />
    </div>
  );
}
