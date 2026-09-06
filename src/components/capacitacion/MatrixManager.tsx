"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Grid3x3, Plus } from "lucide-react";
import { formFieldClass, formLabelClass } from "@/lib/capacitacion/form-styles";

type Master = { id: string; name: string; code: string };
type TrainingOpt = { id: string; title: string; validityDays: number };
type Cell = {
  id: string;
  sede: Master;
  puesto: Master;
  tarea: Master;
  items: { id: string; validityDays: number; training: { id: string; title: string; published: boolean } }[];
  _count: { assignments: number };
};

export function MatrixManager() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [directory, setDirectory] = useState<{ sedes: Master[]; puestos: Master[]; tareas: Master[] }>({
    sedes: [],
    puestos: [],
    tareas: [],
  });
  const [trainings, setTrainings] = useState<TrainingOpt[]>([]);
  const [form, setForm] = useState({
    trainingId: "",
    sedeId: "",
    puestoId: "",
    tareaId: "",
    validityDays: 365,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const [matrixRes, dirRes, trainingsRes] = await Promise.all([
      fetch("/api/admin/matrix"),
      fetch("/api/admin/directory"),
      fetch("/api/admin/trainings"),
    ]);
    if (matrixRes.ok) {
      const data = await matrixRes.json();
      setYear(data.matrix?.year ?? null);
      setCells(data.matrix?.cells ?? []);
    }
    if (dirRes.ok) setDirectory(await dirRes.json());
    if (trainingsRes.ok) {
      const list = await trainingsRes.json();
      setTrainings(list.map((t: TrainingOpt & { validityDays?: number }) => ({
        id: t.id,
        title: t.title,
        validityDays: t.validityDays ?? 365,
      })));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selectedTraining = useMemo(
    () => trainings.find((t) => t.id === form.trainingId),
    [trainings, form.trainingId]
  );

  async function addToCell(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/matrix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setSuccess(`Celda actualizada. ${data.impacted ?? 0} alumno(s) impactados.`);
      await load();
    } else {
      setError(data?.error ?? "No se pudo agregar a la matriz");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <section data-tour="matriz-form" className="overflow-hidden rounded-3xl border border-rule bg-paper-raised">
        <div className="flex items-start gap-4 border-b border-rule px-6 py-5 sm:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rule bg-paper-muted text-ink">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">
              Agregar tema a una celda
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Sector, puesto y tarea son obligatorios. El cambio se materializa en los alumnos de esa intersección.
            </p>
          </div>
        </div>
        <form onSubmit={addToCell} className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className={formLabelClass}>Capacitación</label>
            <select
              required
              value={form.trainingId}
              onChange={(e) => {
                const id = e.target.value;
                const training = trainings.find((t) => t.id === id);
                setForm({
                  ...form,
                  trainingId: id,
                  validityDays: training?.validityDays ?? form.validityDays,
                });
              }}
              className={formFieldClass}
            >
              <option value="">Seleccioná un tema</option>
              {trainings.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={formLabelClass}>Sector</label>
            <select
              required
              value={form.sedeId}
              onChange={(e) => setForm({ ...form, sedeId: e.target.value })}
              className={formFieldClass}
            >
              <option value="">Sector</option>
              {directory.sedes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={formLabelClass}>Puesto</label>
            <select
              required
              value={form.puestoId}
              onChange={(e) => setForm({ ...form, puestoId: e.target.value })}
              className={formFieldClass}
            >
              <option value="">Puesto</option>
              {directory.puestos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={formLabelClass}>Tarea</label>
            <select
              required
              value={form.tareaId}
              onChange={(e) => setForm({ ...form, tareaId: e.target.value })}
              className={formFieldClass}
            >
              <option value="">Tarea</option>
              {directory.tareas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={formLabelClass}>Vigencia (días)</label>
            <input
              type="number"
              min={1}
              required
              value={form.validityDays}
              onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}
              className={formFieldClass}
            />
          </div>
          <div className="flex items-end lg:col-span-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-red-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red disabled:opacity-60"
            >
              {saving ? "Aplicando..." : "Impactar en la matriz"}
            </button>
            {selectedTraining ? (
              <p className="ml-4 text-xs text-ink-muted">Tema seleccionado: {selectedTraining.title}</p>
            ) : null}
          </div>
          {error && <p className="text-sm text-red-300 lg:col-span-5">{error}</p>}
          {success && <p className="text-sm text-emerald-300 lg:col-span-5">{success}</p>}
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-rule bg-paper-raised">
        <div className="flex items-start gap-4 border-b border-rule px-6 py-5 sm:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rule bg-paper-muted text-ink">
            <Grid3x3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">
              Celdas publicadas {year ? `· ${year}` : ""}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Cada fila es puesto × tarea × sede. Los temas sin esa terna no se listan.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          {cells.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-muted">
              Todavía no hay celdas en la matriz publicada.
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-paper-muted text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                <tr>
                  <th className="px-5 py-3">Sector</th>
                  <th className="px-5 py-3">Puesto</th>
                  <th className="px-5 py-3">Tarea</th>
                  <th className="px-5 py-3">Temas</th>
                  <th className="px-5 py-3">Asignaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {cells.map((cell) => (
                  <tr key={cell.id} className="align-top text-ink-muted">
                    <td className="px-5 py-3 text-ink-muted">{cell.sede.name}</td>
                    <td className="px-5 py-3">{cell.puesto.name}</td>
                    <td className="px-5 py-3">{cell.tarea.name}</td>
                    <td className="px-5 py-3">
                      <ul className="space-y-1 text-xs text-ink-muted">
                        {cell.items.map((item) => (
                          <li key={item.id}>
                            {item.training.title}
                            <span className="text-ink-muted"> · {item.validityDays} días</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-3">{cell._count.assignments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
