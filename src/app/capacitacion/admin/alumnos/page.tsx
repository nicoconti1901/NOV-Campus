import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { AlumnosManager } from "@/components/capacitacion/AlumnosManager";

export default async function AdminAlumnosPage() {
  await requireAdminPage();

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-3xl bg-white/95 shadow-xl ring-1 ring-white/70 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-brand-gray to-brand-dark px-6 py-7 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Gestión de accesos
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Alumnos y DNIs</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Habilitá documentos, buscá por apellido o DNI y consultá el progreso de cada participante.
          </p>
        </div>
      </div>
      <AlumnosManager />
    </div>
  );
}
