import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { ProgressQueryForm } from "@/components/capacitacion/ProgressQueryForm";
import { requireProgressPage } from "@/lib/capacitacion/auth-guards";
import { isCompanyRole } from "@/lib/capacitacion/admin-access";
import { MATRIX_YEAR } from "@/lib/capacitacion/matrix-catalog";
import {
  assignmentHeadline,
  rankSedesByRisk,
  sedeHealth,
  shortSedeName,
  type AssignmentBucket,
  type SedeHealth,
} from "@/lib/capacitacion/matrix-engine";
import { getProgressKpis, type SedeProgressRow } from "@/lib/capacitacion/matrix-service";
import {
  EMPTY_PROGRESS_QUERY,
  collectProgressOptions,
  filterProgressRows,
  paginateProgressRows,
  parseProgressPage,
  parseProgressQuery,
  progressQueryHref,
  progressQueryIsEmpty,
  sortProgressRows,
} from "@/lib/capacitacion/progress-query";
import { formatDniDisplay } from "@/lib/capacitacion/utils";

export const dynamic = "force-dynamic";

function studentName(student: { firstName: string | null; lastName: string | null }) {
  const name = [student.lastName, student.firstName].filter(Boolean).join(", ");
  return name || "Sin perfil";
}

const BUCKET_STYLE: Record<string, string> = {
  completed: "bg-stock-valid text-stock-valid-ink",
  due_soon: "bg-stock-due text-stock-due-ink",
  expired: "bg-stock-expired text-stock-expired-ink",
  pending: "bg-stock-assigned text-stock-assigned-ink",
};

const HEALTH: Record<SedeHealth, { label: string; chip: string; pip: string }> = {
  critical: { label: "Critico", chip: "bg-red-50 text-red-800 ring-red-200", pip: "bg-red-600" },
  watch: { label: "Atencion", chip: "bg-amber-50 text-amber-900 ring-amber-200", pip: "bg-amber-500" },
  on_track: { label: "En orden", chip: "bg-emerald-50 text-emerald-800 ring-emerald-200", pip: "bg-emerald-600" },
  empty: { label: "Sin cobertura", chip: "bg-slate-100 text-slate-600 ring-slate-200", pip: "bg-slate-400" },
};

function MixBar({
  assigned,
  completed,
  dueSoon,
  pending,
  expired,
  large = false,
}: Pick<SedeProgressRow, "assigned" | "completed" | "dueSoon" | "pending" | "expired"> & { large?: boolean }) {
  if (assigned <= 0) {
    return <div className={`w-full rounded-full ${large ? "h-3 bg-white/15" : "h-2 bg-slate-200"}`} />;
  }
  const parts = [
    { key: "completed", n: completed, fill: "bg-emerald-400" },
    { key: "dueSoon", n: dueSoon, fill: "bg-amber-400" },
    { key: "pending", n: pending, fill: "bg-sky-400" },
    { key: "expired", n: expired, fill: "bg-red-500" },
  ];
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-slate-200/80 ${large ? "h-3" : "h-2"}`}>
      {parts
        .filter((part) => part.n > 0)
        .map((part) => (
          <span
            key={part.key}
            className={part.fill}
            style={{ width: `${(part.n / assigned) * 100}%` }}
          />
        ))}
    </div>
  );
}

function campusHeadline(kpis: {
  assigned: number;
  expired: number;
  dueSoon: number;
  sedesCovered: number;
  sedesTotal: number;
}) {
  if (kpis.assigned === 0) {
    return "La matriz esta publicada, pero todavia no hay asignaciones materializadas en ninguna sede.";
  }
  if (kpis.expired > 0) {
    return `${kpis.expired} asignaciones fuera de vigencia. El cumplimiento de la matriz requiere recursado inmediato.`;
  }
  if (kpis.dueSoon > 0) {
    return `${kpis.dueSoon} asignaciones entran en ventana de 30 dias. El resto se mantiene vigente.`;
  }
  if (kpis.sedesCovered < kpis.sedesTotal) {
    return `Asignaciones vigentes. ${kpis.sedesTotal - kpis.sedesCovered} sedes todavia no tienen personal materializado.`;
  }
  return "Todas las asignaciones materializadas estan vigentes.";
}

function paginationWindow(current: number, pageCount: number) {
  const pages = new Set([1, pageCount, current - 1, current, current + 1]);
  return [...pages].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b);
}

export default async function AdminProgressPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sede?: string;
    estado?: string;
    puesto?: string;
    tarea?: string;
    curso?: string;
    sala?: string;
    page?: string;
  }>;
}) {
  const session = await requireProgressPage();
  const companyView = isCompanyRole(session.adminRole);
  const params = await searchParams;
  const query = parseProgressQuery(params);
  const kpis = await getProgressKpis();
  const ranked = rankSedesByRisk(kpis.bySede);
  const options = collectProgressOptions(kpis.rows);
  const filtered = sortProgressRows(filterProgressRows(kpis.rows, query));
  const page = paginateProgressRows(filtered, parseProgressPage(params.page));
  const year = kpis.year ?? MATRIX_YEAR;
  const asOf = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const complianceLabel = kpis.complianceRate == null ? "—" : `${kpis.complianceRate}%`;

  const strip: { label: string; value: number; tone: string; estado: AssignmentBucket }[] = [
    { label: "Vigentes", value: kpis.completed, tone: "text-emerald-300", estado: "completed" },
    { label: "Por vencer", value: kpis.dueSoon, tone: "text-amber-300", estado: "due_soon" },
    { label: "Pendientes", value: kpis.pending, tone: "text-sky-300", estado: "pending" },
    { label: "Vencidas", value: kpis.expired, tone: "text-red-300", estado: "expired" },
  ];
  const filtersEmpty = progressQueryIsEmpty(query);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-brand-navy text-paper shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)]" data-tour="progress-kpis">
        <div className="flex flex-wrap items-start justify-between gap-6 px-6 py-7 sm:px-8">
          <div className="max-w-xl">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200">
              {companyView
                ? `Representante de la empresa · Matriz HSE ${year}`
                : `Matriz HSE ${year} · Solo lectura`}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.05em] sm:text-4xl">
              Cumplimiento del campus
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">{campusHeadline(kpis)}</p>
            <p className="mt-2 text-xs text-paper/45">Corte al {asOf}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/50">
              Asignaciones vigentes
            </p>
            <p className="mt-1 font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
              {complianceLabel}
            </p>
            <p className="mt-2 text-sm text-paper/60">
              {kpis.completed} de {kpis.assigned} materializadas
            </p>
            <a
              href="/api/admin/progress/export"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-paper/80 transition-colors hover:bg-white/10 hover:text-paper"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar CSV
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/15 px-6 py-5 sm:px-8">
          <MixBar
            large
            assigned={kpis.assigned}
            completed={kpis.completed}
            dueSoon={kpis.dueSoon}
            pending={kpis.pending}
            expired={kpis.expired}
          />
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
            {strip.map((item) => {
              const active = query.estado === item.estado && !query.q && !query.sede && !query.puesto && !query.tarea && !query.curso && !query.sala;
              return (
                <Link
                  key={item.label}
                  href={progressQueryHref({ ...EMPTY_PROGRESS_QUERY, estado: item.estado })}
                  className={`bg-brand-navy px-4 py-3 transition-colors hover:bg-white/5 ${active ? "ring-1 ring-inset ring-white/30" : ""}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/45">{item.label}</p>
                  <p className={`mt-1 font-display text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-paper/50">
            <span>{kpis.sedesCovered} de {kpis.sedesTotal} sedes con asignaciones</span>
            <span>{kpis.sedesAtRisk} sedes en seguimiento</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Vigente</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Por vencer</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-sky-400" /> Pendiente</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Vencida</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
              Estado por sede
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Ranking por riesgo. Las sedes sin personal asignado tambien se muestran.
            </p>
          </div>
          {query.sede ? (
            <Link href="/capacitacion/admin/progreso" className="text-xs font-semibold text-brand-red hover:underline">
              Ver campus completo
            </Link>
          ) : null}
        </div>
        <ol className="divide-y divide-slate-100">
          {ranked.map((item) => {
            const health = sedeHealth(item);
            const meta = HEALTH[health];
            const active = query.sede === item.sede;
            return (
              <li key={item.sedeId}>
                <Link
                  href={progressQueryHref({ ...EMPTY_PROGRESS_QUERY, sede: item.sede })}
                  className={`grid gap-3 px-5 py-4 transition-colors sm:grid-cols-[minmax(0,14rem)_1fr_auto] sm:items-center sm:px-6 ${
                    active ? "bg-slate-50" : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.pip}`} />
                      <span className="truncate">{shortSedeName(item.sede)}</span>
                    </p>
                    <p className="mt-0.5 truncate pl-[18px] text-[11px] text-ink-muted">{item.sede}</p>
                    <p className="mt-1 pl-[18px] text-[11px] text-ink-muted">
                      {item.people} {item.people === 1 ? "persona" : "personas"} · {item.cells} celdas en matriz
                    </p>
                  </div>
                  <div className="min-w-0">
                    <MixBar
                      assigned={item.assigned}
                      completed={item.completed}
                      dueSoon={item.dueSoon}
                      pending={item.pending}
                      expired={item.expired}
                    />
                    <p className="mt-1.5 text-[11px] tabular-nums text-ink-muted">
                      {item.completed} vig. · {item.dueSoon} por venc. · {item.pending} pend. · {item.expired} venc. · {item.assigned} asg.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <p className="font-display text-2xl font-semibold tabular-nums text-ink">
                      {item.complianceRate == null ? "—" : `${item.complianceRate}%`}
                    </p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1 ${meta.chip}`}>
                      {meta.label}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="overflow-hidden rounded-3xl bg-white/85 ring-1 ring-slate-200/80">
        <div className="border-b border-rule px-5 py-4 sm:px-6">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">
            Consulta de asignaciones
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Filtrá por persona, sede, estado, puesto, tarea, sala o curso. El listado cubre todo el campus, no solo excepciones.
          </p>
        </div>
        <ProgressQueryForm query={query} options={options} />
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 text-xs text-ink-muted sm:px-6">
          <p>
            {page.total === 0
              ? "Sin resultados para esta consulta."
              : filtersEmpty
                ? `${page.from}–${page.to} de ${page.total} asignaciones del campus`
                : `${page.from}–${page.to} de ${page.total} resultados · ${kpis.assigned} en el campus`}
          </p>
          {page.pageCount > 1 ? (
            <p>
              Pagina {page.page} de {page.pageCount}
            </p>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          {page.items.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">
              {filtersEmpty
                ? "Todavia no hay asignaciones materializadas."
                : "Ninguna asignacion coincide con los filtros. Amplia o limpia la consulta."}
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-paper-muted text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                <tr>
                  <th className="px-5 py-3">Alumno</th>
                  <th className="px-5 py-3">Celda</th>
                  <th className="px-5 py-3">Capacitacion</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Vence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {page.items.map((row) => (
                  <tr key={row.id} className="text-ink-muted">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{studentName(row.student)}</p>
                      <p className="text-xs text-ink-muted">{formatDniDisplay(row.student.dni)}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-muted">
                      {row.cell.puesto.name} · {row.cell.tarea.name}
                      <br />
                      {row.cell.sede.name}
                    </td>
                    <td className="px-5 py-3">
                      <p>{row.training.title}</p>
                      <p className="text-xs text-ink-muted">{row.training.room.name}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${BUCKET_STYLE[row.bucket]}`}>
                        {assignmentHeadline(row.bucket)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {row.dueAt.toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {page.pageCount > 1 ? (
          <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:px-6">
            <Link
              href={progressQueryHref(query, Math.max(1, page.page - 1))}
              aria-disabled={page.page === 1}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                page.page === 1 ? "pointer-events-none text-ink-muted/40" : "text-ink hover:bg-paper-muted"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
            <div className="flex flex-wrap items-center gap-1">
              {paginationWindow(page.page, page.pageCount).map((item, index, list) => (
                <span key={item} className="flex items-center gap-1">
                  {index > 0 && item - list[index - 1] > 1 ? (
                    <span className="px-1 text-xs text-ink-muted">…</span>
                  ) : null}
                  <Link
                    href={progressQueryHref(query, item)}
                    className={`min-w-9 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold ${
                      item === page.page ? "bg-brand-navy text-paper" : "text-ink hover:bg-paper-muted"
                    }`}
                  >
                    {item}
                  </Link>
                </span>
              ))}
            </div>
            <Link
              href={progressQueryHref(query, Math.min(page.pageCount, page.page + 1))}
              aria-disabled={page.page === page.pageCount}
              className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                page.page === page.pageCount ? "pointer-events-none text-ink-muted/40" : "text-ink hover:bg-paper-muted"
              }`}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
