"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  BarChart3,
  Building2,
  ChevronDown,
  Clock3,
  Filter,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  AREAS,
  COMPETENCIES,
  MATRIX_RECORDS,
  ROLES,
  TAREAS,
  STATUS_LABEL,
  matrixKpis,
  type CompetencyRecord,
  type CompetencyStatus,
  type ControlType,
  type StaffType,
} from "@/lib/capacitacion/competency-matrix";

const EMPTY_FILTERS = {
  q: "",
  area: "",
  role: "",
  tarea: "",
  competency: "",
  status: "",
  staff: "",
  tipo: "",
};
type Filters = typeof EMPTY_FILTERS;

function matches(r: CompetencyRecord, f: Filters) {
  const q = f.q.trim().toLowerCase();
  if (q) {
    const blob = `${r.name} ${r.legajo} ${r.area} ${r.role} ${r.tarea} ${r.competency}`.toLowerCase();
    if (!blob.includes(q)) return false;
  }
  if (f.area && r.area !== f.area) return false;
  if (f.role && r.role !== f.role) return false;
  if (f.tarea && r.tarea !== f.tarea) return false;
  if (f.competency && r.competency !== f.competency) return false;
  if (f.status && r.status !== f.status) return false;
  if (f.staff && r.staff !== f.staff) return false;
  if (f.tipo && r.tipo !== f.tipo) return false;
  return true;
}

const STATUS_STYLE: Record<CompetencyStatus, string> = {
  vigente: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  vencida: "bg-brand-red/15 text-red-300 ring-1 ring-brand-red/30",
  sin_fecha: "bg-white/10 text-white/60 ring-1 ring-white/20",
};

const STATUS_DOT: Record<CompetencyStatus, string> = {
  vigente: "bg-emerald-500",
  vencida: "bg-brand-red",
  sin_fecha: "bg-white/40",
};

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.14em] text-white/40">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-white/12 bg-[#161a20] px-3 py-2.5 text-sm text-white/90 outline-none focus:border-[#c9a227]/70 focus:ring-1 focus:ring-[#c9a227]/25"
      >
        {children}
      </select>
    </label>
  );
}

export function CompetencyMatrixDashboard() {
  const kpis = useMemo(() => matrixKpis(), []);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [alertOpen, setAlertOpen] = useState(true);

  const results = useMemo(
    () => (!applied ? [] : MATRIX_RECORDS.filter((r) => matches(r, applied))),
    [applied]
  );

  function set<K extends keyof Filters>(key: K, value: string) {
    setDraft((c) => ({ ...c, [key]: value }));
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
          ISO 9001 / 14001 / 45001 · Cláusula 7.2 Competencia — EPS WellChek 2026
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.06em] text-white">
          Matriz de competencias HSE
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
          Tablero de supervisión HSE · Cubrimiento, vencimientos y evidencias por puesto · Datos de muestra
        </p>
      </div>

      {/* Alerta de vencimientos */}
      {kpis.alertas.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-brand-red/30 bg-brand-red/10">
          <button
            type="button"
            onClick={() => setAlertOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left"
          >
            <span className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-brand-red" />
              <span className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-white">
                {kpis.vencida} competencia{kpis.vencida !== 1 ? "s" : ""} vencida
                {kpis.vencida !== 1 ? "s" : ""} · {kpis.alertas.length} persona
                {kpis.alertas.length !== 1 ? "s" : ""} afectada{kpis.alertas.length !== 1 ? "s" : ""}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-white/50 transition-transform ${alertOpen ? "rotate-180" : ""}`}
            />
          </button>
          {alertOpen && (
            <div className="border-t border-brand-red/20 px-5 pb-4 pt-3">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.alertas.map((a) => (
                  <div key={a.legajo} className="rounded-xl border border-brand-red/20 bg-black/25 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{a.name.split(",")[0]}</p>
                    <p className="mt-0.5 text-xs text-white/50">{a.area}</p>
                    <p className="mt-2 text-xs font-semibold text-brand-red">
                      {a.count} competencia{a.count !== 1 ? "s" : ""} vencida{a.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraft({ ...EMPTY_FILTERS, status: "vencida" });
                  setApplied({ ...EMPTY_FILTERS, status: "vencida" });
                }}
                className="mt-3 text-xs font-semibold text-brand-red/80 hover:text-brand-red"
              >
                Ver todas las vencidas en la tabla →
              </button>
            </div>
          )}
        </section>
      )}

      {/* KPIs principales */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Conformidad ISO 7.2", value: `${kpis.conformity}%`, hint: "Registros vigentes / total", icon: ShieldCheck, accent: kpis.conformity < 70 ? "text-brand-red" : "text-[#c9a227]" },
          { label: "Personal en matriz", value: String(kpis.people), hint: `${kpis.total} registros totales`, icon: Users, accent: "text-[#c9a227]" },
          { label: "Competencias vencidas", value: String(kpis.vencida), hint: "Requieren recertificación", icon: XCircle, accent: kpis.vencida > 0 ? "text-brand-red" : "text-[#c9a227]" },
          { label: "Sin fecha / sin registro", value: String(kpis.sin_fecha), hint: "No se registró evidencia", icon: Clock3, accent: "text-white/40" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-brand-black/65 px-5 py-4">
            <item.icon className={`h-5 w-5 ${item.accent}`} />
            <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/40">{item.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-white">{item.value}</p>
            <p className="mt-1 text-xs text-white/45">{item.hint}</p>
          </div>
        ))}
      </section>

      {/* KPIs secundarios */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Vigentes", value: kpis.vigente, icon: BadgeCheck },
          { label: "Hs. cap. vigentes", value: kpis.hoursTotal, icon: BarChart3 },
          { label: "Propio NOV", value: `${kpis.ownPct}%`, icon: Building2 },
          { label: "Contratistas", value: `${kpis.contractorPct}%`, icon: Users },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-brand-black/50 px-4 py-3">
            <item.icon className="h-4 w-4 text-white/45" />
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/40">{item.label}</p>
            <p className="mt-0.5 font-display text-xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Cobertura por área */}
      <section className="rounded-2xl border border-white/10 bg-brand-black/55 p-5">
        <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-white/40">Cobertura vigente por área (HSE 360)</p>
        <div className="space-y-3">
          {kpis.byArea.filter((a) => a.count > 0).map((row) => (
            <div key={row.area}>
              <div className="mb-1 flex items-start justify-between gap-3 text-xs text-white/60">
                <span className="leading-snug">{row.area}</span>
                <span className="shrink-0 font-semibold">
                  {row.pct}%
                  {row.expired > 0 && (
                    <span className="ml-2 text-brand-red">· {row.expired} vencida{row.expired !== 1 ? "s" : ""}</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${row.pct < 60 ? "bg-brand-red" : row.pct < 80 ? "bg-amber-400" : "bg-[#c9a227]"}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Buscador */}
      <section className="rounded-3xl border border-white/10 bg-brand-black/70 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#c9a227]" />
          <h2 className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-white">
            Consultar matriz
          </h2>
        </div>
        <p className="mb-5 text-sm text-white/50">
          Filtrá por área de cobertura, tarea, rol, competencia, estado o tipo de control.
        </p>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-gray-light" />
          <input
            value={draft.q}
            onChange={(e) => set("q", e.target.value)}
            placeholder="Buscar por nombre, legajo, tarea o competencia…"
            className="w-full rounded-2xl border border-white/20 bg-surface-card py-3.5 pl-12 pr-4 text-sm text-brand-dark outline-none placeholder:text-brand-gray-light focus:border-[#c9a227]"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField label="Área de cobertura" value={draft.area} onChange={(v) => set("area", v)}>
            <option value="">Todas</option>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </SelectField>

          <SelectField label="Tarea asignada" value={draft.tarea} onChange={(v) => set("tarea", v)}>
            <option value="">Todas</option>
            {TAREAS.map((t) => <option key={t} value={t}>{t}</option>)}
          </SelectField>

          <SelectField label="Puesto" value={draft.role} onChange={(v) => set("role", v)}>
            <option value="">Todos</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </SelectField>

          <SelectField label="Competencia" value={draft.competency} onChange={(v) => set("competency", v)}>
            <option value="">Todas</option>
            {COMPETENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectField>

          <SelectField label="Estado" value={draft.status} onChange={(v) => set("status", v)}>
            <option value="">Todos</option>
            {(Object.keys(STATUS_LABEL) as CompetencyStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </SelectField>

          <SelectField label="Tipo de control" value={draft.tipo} onChange={(v) => set("tipo", v)}>
            <option value="">Todos</option>
            {(["Periódica", "Evento"] as ControlType[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </SelectField>

          <SelectField label="Tipo de personal" value={draft.staff} onChange={(v) => set("staff", v)}>
            <option value="">Todos</option>
            <option value="propio">Propio NOV</option>
            <option value="contratista">Contratista</option>
          </SelectField>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setApplied(draft)}
            className="rounded-xl bg-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#10161e] hover:bg-[#d4ad3a]"
          >
            Consultar
          </button>
          <button
            type="button"
            onClick={() => { setDraft(EMPTY_FILTERS); setApplied(null); }}
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"
          >
            Limpiar
          </button>
        </div>
      </section>

      {/* Resultados */}
      {applied && (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-brand-black/70">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="font-display font-semibold uppercase tracking-[0.08em] text-white">
              Resultado · {results.length} registro{results.length !== 1 ? "s" : ""}
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Cada fila es una competencia registrada para un empleado (ISO 7.2).
            </p>
          </div>

          {results.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-white/50">No hay registros con esos filtros.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-[0.12em] text-white/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Empleado</th>
                    <th className="px-4 py-3 font-medium">Área / Tarea</th>
                    <th className="px-4 py-3 font-medium">Competencia</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Vigencia</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {results.map((r) => (
                    <tr key={r.id} className={r.status === "vencida" ? "bg-brand-red/5" : ""}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{r.name.split(",")[0]}</p>
                        <p className="text-xs text-white/40">
                          {r.legajo} · {r.staff === "propio" ? "NOV" : "Contratista"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        <p className="text-xs text-white/40">{r.area}</p>
                        {r.tarea}
                      </td>
                      <td className="px-4 py-3 text-white">{r.competency}</td>
                      <td className="px-4 py-3 text-white/55">{r.tipo}</td>
                      <td className="px-4 py-3 text-white/55">{r.vigencia > 0 ? `${r.vigencia} d.` : "—"}</td>
                      <td className="px-4 py-3 text-white/60">{r.expires ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-[11px] text-white/45">
        {(Object.keys(STATUS_LABEL) as CompetencyStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[s]}`} />
            {STATUS_LABEL[s]}
          </span>
        ))}
        <span className="text-white/25">· Datos de muestra / demo</span>
      </div>
    </div>
  );
}
