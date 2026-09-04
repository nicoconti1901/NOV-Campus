import { ASSIGNMENT_STATUS, NOTICE_WINDOWS_DAYS } from "@/lib/capacitacion/constants";
import { MATRIX_CELLS, type MatrixCellDef } from "@/lib/capacitacion/matrix-catalog";

export type AssignmentBucket = "pending" | "due_soon" | "expired" | "completed";

export type AssignmentSnapshot = {
  status: string;
  dueAt: Date;
  completedAt: Date | null;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * MS_PER_DAY);
}

export function daysUntil(dueAt: Date, now: Date = new Date()): number {
  return Math.ceil((dueAt.getTime() - now.getTime()) / MS_PER_DAY);
}

export function cellKey(sedeId: string, puestoId: string, tareaId: string): string {
  return `${sedeId}::${puestoId}::${tareaId}`;
}

export function findCellDefinition(
  sedeCode: string,
  puestoCode: string,
  tareaCode: string,
  cells: MatrixCellDef[] = MATRIX_CELLS
): MatrixCellDef | undefined {
  return cells.find(
    (cell) =>
      cell.sedeCode === sedeCode &&
      cell.puestoCode === puestoCode &&
      cell.tareaCode === tareaCode
  );
}

export function classifyAssignment(
  assignment: AssignmentSnapshot,
  now: Date = new Date()
): AssignmentBucket {
  if (now.getTime() >= assignment.dueAt.getTime()) return "expired";
  const remaining = daysUntil(assignment.dueAt, now);
  if (assignment.status === ASSIGNMENT_STATUS.COMPLETED) {
    if (remaining <= 30) return "due_soon";
    return "completed";
  }
  if (remaining <= 30) return "due_soon";
  return "pending";
}

export function shouldMarkExpired(
  assignment: AssignmentSnapshot,
  now: Date = new Date()
): boolean {
  return (
    assignment.status !== ASSIGNMENT_STATUS.EXPIRED &&
    now.getTime() >= assignment.dueAt.getTime()
  );
}

export function dueAtFromAssigned(assignedAt: Date, validityDays: number): Date {
  return addDays(assignedAt, validityDays);
}

export function dueAtFromCompleted(completedAt: Date, validityDays: number): Date {
  return addDays(completedAt, validityDays);
}

export type NoticeKind = (typeof NOTICE_WINDOWS_DAYS)[number] | "expired";

export function nextNoticeKind(
  assignment: {
    dueAt: Date;
    notice30At: Date | null;
    notice7At: Date | null;
    notice1At: Date | null;
    noticeExpiredAt: Date | null;
  },
  now: Date = new Date()
): NoticeKind | null {
  const remaining = daysUntil(assignment.dueAt, now);
  if (remaining <= 0) {
    return assignment.noticeExpiredAt ? null : "expired";
  }
  if (remaining <= 1 && !assignment.notice1At) return 1;
  if (remaining <= 7 && !assignment.notice7At) return 7;
  if (remaining <= 30 && !assignment.notice30At) return 30;
  return null;
}

export function assignmentHeadline(bucket: AssignmentBucket): string {
  switch (bucket) {
    case "expired":
      return "Vencida";
    case "due_soon":
      return "Por vencer";
    case "completed":
      return "Vigente";
    default:
      return "Pendiente";
  }
}

export type SedeHealth = "critical" | "watch" | "on_track" | "empty";

export type SedeProgressSnapshot = {
  assigned: number;
  completed: number;
  expired: number;
  dueSoon: number;
  pending: number;
};

export function complianceRate(assigned: number, completed: number): number | null {
  if (assigned <= 0) return null;
  return Math.round((completed / assigned) * 100);
}

export function sedeHealth(row: Pick<SedeProgressSnapshot, "assigned" | "expired" | "dueSoon">): SedeHealth {
  if (row.assigned <= 0) return "empty";
  if (row.expired > 0) return "critical";
  if (row.dueSoon > 0) return "watch";
  return "on_track";
}

export function shortSedeName(name: string): string {
  const stripped = name.replace(/^TB AR (CRV )?/i, "").trim();
  return stripped || name;
}

export function rankSedesByRisk<T extends SedeProgressSnapshot & { sede: string }>(rows: T[]): T[] {
  const order: Record<SedeHealth, number> = { critical: 0, watch: 1, empty: 2, on_track: 3 };
  return [...rows].sort((a, b) => {
    const healthDelta = order[sedeHealth(a)] - order[sedeHealth(b)];
    if (healthDelta !== 0) return healthDelta;
    if (b.expired !== a.expired) return b.expired - a.expired;
    if (b.dueSoon !== a.dueSoon) return b.dueSoon - a.dueSoon;
    const ca = complianceRate(a.assigned, a.completed) ?? -1;
    const cb = complianceRate(b.assigned, b.completed) ?? -1;
    if (ca !== cb) return ca - cb;
    return a.sede.localeCompare(b.sede, "es");
  });
}
