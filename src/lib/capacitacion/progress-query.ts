import { assignmentHeadline, type AssignmentBucket } from "@/lib/capacitacion/matrix-engine";

export const PROGRESS_PAGE_SIZE = 80;

export type ProgressQuery = {
  q: string;
  sede: string;
  estado: AssignmentBucket | "";
  puesto: string;
  tarea: string;
  curso: string;
  sala: string;
};

export type ProgressQueryRow = {
  id: string;
  bucket: AssignmentBucket;
  dueAt: Date;
  student: {
    dni: string;
    firstName: string | null;
    lastName: string | null;
  };
  training: {
    title: string;
    room: { name: string; slug: string };
  };
  cell: {
    sede: { name: string };
    puesto: { name: string };
    tarea: { name: string };
  };
};

export const EMPTY_PROGRESS_QUERY: ProgressQuery = {
  q: "",
  sede: "",
  estado: "",
  puesto: "",
  tarea: "",
  curso: "",
  sala: "",
};

export const PROGRESS_ESTADO_OPTIONS: { value: AssignmentBucket | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "expired", label: "Vencida" },
  { value: "due_soon", label: "Por vencer" },
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Vigente" },
];

const BUCKET_RANK: Record<AssignmentBucket, number> = {
  expired: 0,
  due_soon: 1,
  pending: 2,
  completed: 3,
};

const ESTADOS = new Set<AssignmentBucket>(["pending", "due_soon", "expired", "completed"]);

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}

function compact(value: string | undefined) {
  return value?.trim() ?? "";
}

export function parseProgressQuery(params: {
  q?: string;
  sede?: string;
  estado?: string;
  puesto?: string;
  tarea?: string;
  curso?: string;
  sala?: string;
}): ProgressQuery {
  const estado = compact(params.estado);
  return {
    q: compact(params.q),
    sede: compact(params.sede),
    estado: ESTADOS.has(estado as AssignmentBucket) ? (estado as AssignmentBucket) : "",
    puesto: compact(params.puesto),
    tarea: compact(params.tarea),
    curso: compact(params.curso),
    sala: compact(params.sala),
  };
}

export function progressQueryIsEmpty(query: ProgressQuery) {
  return (
    !query.q &&
    !query.sede &&
    !query.estado &&
    !query.puesto &&
    !query.tarea &&
    !query.curso &&
    !query.sala
  );
}

export function progressQueryHref(query: ProgressQuery, page = 1) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sede) params.set("sede", query.sede);
  if (query.estado) params.set("estado", query.estado);
  if (query.puesto) params.set("puesto", query.puesto);
  if (query.tarea) params.set("tarea", query.tarea);
  if (query.curso) params.set("curso", query.curso);
  if (query.sala) params.set("sala", query.sala);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/capacitacion/admin/progreso?${qs}` : "/capacitacion/admin/progreso";
}

export function parseProgressPage(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function matchesQuery(row: ProgressQueryRow, needle: string) {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  const name = [row.student.lastName, row.student.firstName].filter(Boolean).join(" ").toLowerCase();
  const reverse = [row.student.firstName, row.student.lastName].filter(Boolean).join(" ").toLowerCase();
  const blob = [
    name,
    reverse,
    row.student.dni,
    row.training.title,
    row.cell.sede.name,
    row.cell.puesto.name,
    row.cell.tarea.name,
    row.training.room.name,
    assignmentHeadline(row.bucket),
  ]
    .join(" ")
    .toLowerCase();
  if (blob.includes(q)) return true;
  const qDigits = digits(q);
  return qDigits.length >= 3 && row.student.dni.includes(qDigits);
}

export function filterProgressRows<T extends ProgressQueryRow>(rows: T[], query: ProgressQuery): T[] {
  return rows.filter((row) => {
    if (query.sede && row.cell.sede.name !== query.sede) return false;
    if (query.estado && row.bucket !== query.estado) return false;
    if (query.puesto && row.cell.puesto.name !== query.puesto) return false;
    if (query.tarea && row.cell.tarea.name !== query.tarea) return false;
    if (query.curso && row.training.title !== query.curso) return false;
    if (query.sala && row.training.room.slug !== query.sala) return false;
    return matchesQuery(row, query.q);
  });
}

export function sortProgressRows<T extends ProgressQueryRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const rank = BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket];
    if (rank !== 0) return rank;
    const due = a.dueAt.getTime() - b.dueAt.getTime();
    if (due !== 0) return due;
    const nameA = [a.student.lastName, a.student.firstName].filter(Boolean).join(" ");
    const nameB = [b.student.lastName, b.student.firstName].filter(Boolean).join(" ");
    return nameA.localeCompare(nameB, "es");
  });
}

export function paginateProgressRows<T>(rows: T[], page: number, size = PROGRESS_PAGE_SIZE) {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / size) || 1);
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * size;
  return {
    items: rows.slice(start, start + size),
    total,
    page: current,
    pageCount,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + size, total),
  };
}

export function collectProgressOptions(rows: ProgressQueryRow[]) {
  const salas = new Map<string, string>();
  for (const row of rows) {
    if (!salas.has(row.training.room.slug)) {
      salas.set(row.training.room.slug, row.training.room.name);
    }
  }
  return {
    sedes: uniqueSorted(rows.map((row) => row.cell.sede.name)),
    puestos: uniqueSorted(rows.map((row) => row.cell.puesto.name)),
    tareas: uniqueSorted(rows.map((row) => row.cell.tarea.name)),
    cursos: uniqueSorted(rows.map((row) => row.training.title)),
    salas: [...salas.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
  };
}

export type ProgressFilterOptions = ReturnType<typeof collectProgressOptions>;
