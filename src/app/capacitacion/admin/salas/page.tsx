import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { RoomsManager } from "@/components/capacitacion/RoomsManager";

export default async function AdminSalasPage() {
  await requireAdminPage();

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-3xl bg-white/95 shadow-xl ring-1 ring-white/70 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-brand-red to-brand-red-dark px-6 py-7 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Configuración
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Salas</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/85">
            Creá, editá o eliminá las salas temáticas del campus. Al borrar una sala también se
            eliminan sus capacitaciones.
          </p>
        </div>
      </div>
      <RoomsManager />
    </div>
  );
}
