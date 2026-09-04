"use client";

import type { ChangeEvent, ReactNode } from "react";
import { Search } from "lucide-react";
import { formFieldClass, formLabelClass, formSecondaryBtnClass } from "@/lib/capacitacion/form-styles";
import {
  PROGRESS_ESTADO_OPTIONS,
  progressQueryIsEmpty,
  type ProgressFilterOptions,
  type ProgressQuery,
} from "@/lib/capacitacion/progress-query";

function submitOnChange(event: ChangeEvent<HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={formLabelClass}>{label}</span>
      {children}
    </label>
  );
}

export function ProgressQueryForm({
  query,
  options,
}: {
  query: ProgressQuery;
  options: ProgressFilterOptions;
}) {
  const empty = progressQueryIsEmpty(query);

  return (
    <form action="/capacitacion/admin/progreso" method="get" className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          name="q"
          defaultValue={query.q}
          placeholder="Buscar por alumno, DNI, curso, sede, puesto o tarea"
          className={`${formFieldClass} pl-10`}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Sede">
          <select name="sede" defaultValue={query.sede} onChange={submitOnChange} className={formFieldClass}>
            <option value="">Todas las sedes</option>
            {options.sedes.map((sede) => (
              <option key={sede} value={sede}>
                {sede}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado">
          <select name="estado" defaultValue={query.estado} onChange={submitOnChange} className={formFieldClass}>
            {PROGRESS_ESTADO_OPTIONS.map((estado) => (
              <option key={estado.value || "all"} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Puesto">
          <select name="puesto" defaultValue={query.puesto} onChange={submitOnChange} className={formFieldClass}>
            <option value="">Todos los puestos</option>
            {options.puestos.map((puesto) => (
              <option key={puesto} value={puesto}>
                {puesto}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tarea">
          <select name="tarea" defaultValue={query.tarea} onChange={submitOnChange} className={formFieldClass}>
            <option value="">Todas las tareas</option>
            {options.tareas.map((tarea) => (
              <option key={tarea} value={tarea}>
                {tarea}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sala">
          <select name="sala" defaultValue={query.sala} onChange={submitOnChange} className={formFieldClass}>
            <option value="">Todas las salas</option>
            {options.salas.map((sala) => (
              <option key={sala.slug} value={sala.slug}>
                {sala.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Capacitacion">
          <select name="curso" defaultValue={query.curso} onChange={submitOnChange} className={formFieldClass}>
            <option value="">Todas las capacitaciones</option>
            {options.cursos.map((curso) => (
              <option key={curso} value={curso}>
                {curso}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
        >
          Consultar
        </button>
        {empty ? null : (
          <a href="/capacitacion/admin/progreso" className={formSecondaryBtnClass}>
            Limpiar filtros
          </a>
        )}
      </div>
    </form>
  );
}
