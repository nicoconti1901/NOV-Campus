import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  Building2,
  ListChecks,
  Pencil,
  ShieldAlert,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentPage } from "@/lib/capacitacion/auth-guards";
import {
  CampusAssignmentBoard,
  type CampusBoardItem,
} from "@/components/capacitacion/CampusAssignmentBoard";
import {
  getStudentAssignmentViews,
  syncStudentAssignments,
} from "@/lib/capacitacion/matrix-service";
import { daysUntil } from "@/lib/capacitacion/matrix-engine";

export const dynamic = "force-dynamic";

function formatDue(date: Date) {
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function dueLabelFor(item: { bucket: string; dueAt: Date }) {
  if (item.bucket === "expired") return `Venció ${formatDue(item.dueAt)}`;
  if (item.bucket === "completed") return `Hasta ${formatDue(item.dueAt)}`;
  if (item.bucket === "due_soon") {
    const days = daysUntil(item.dueAt);
    return `${formatDue(item.dueAt)} · ${days} día${days === 1 ? "" : "s"}`;
  }
  return formatDue(item.dueAt);
}

export default async function CampusPage() {
  const session = await requireStudentPage();

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: { sede: true, puesto: true, tarea: true },
  });

  if (!student?.profileCompleted || !student.sedeId || !student.puestoId || !student.tareaId) {
    redirect("/capacitacion/campus/perfil");
  }

  await syncStudentAssignments(student.id);
  const assignments = await getStudentAssignmentViews(student.id);

  const now = new Date();
  const activeAlerts = await prisma.alert.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ severity: "desc" }, { publishedAt: "desc" }],
    take: 3,
  });

  const boardItems: CampusBoardItem[] = assignments.map((item) => ({
    id: item.id,
    trainingId: item.trainingId,
    title: item.title,
    roomName: item.room.name,
    bucket: item.bucket,
    dueLabel: dueLabelFor(item),
    progressStatus: item.progressStatus,
    score: item.score,
  }));

  const terna = [
    { label: "Sector", value: student.sede?.name ?? "—", icon: Building2 },
    { label: "Puesto", value: student.puesto?.name ?? "—", icon: Briefcase },
    { label: "Tarea", value: student.tarea?.name ?? "—", icon: ListChecks },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-white/80 ring-1 ring-slate-200/80 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl">
        <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-navy via-brand-red to-teal-500" />
        <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-7">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-4xl">
              Hola, {student.firstName}
            </h1>
          </div>
          <Link
            href="/capacitacion/campus/perfil"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-brand-red-dark"
          >
            <Pencil className="h-4 w-4" />
            Editar perfil
          </Link>
        </div>
        <dl className="grid border-t border-slate-200/80 sm:grid-cols-3">
          {terna.map((field) => (
            <div key={field.label} className="border-slate-200/80 px-5 py-4 sm:border-l sm:px-7 sm:first:border-l-0">
              <dt className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                <field.icon className="h-3.5 w-3.5 text-brand-red" />
                {field.label}
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-ink">{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {activeAlerts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
              Alertas ({activeAlerts.length})
            </h2>
            <Link
              href="/capacitacion/campus/alertas"
              className="text-xs font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert) => {
              const Icon =
                alert.severity === "danger"
                  ? ShieldAlert
                  : alert.severity === "warning"
                    ? AlertTriangle
                    : Bell;
              const stock =
                alert.severity === "danger"
                  ? "bg-stock-expired text-stock-expired-ink ring-red-200"
                  : alert.severity === "warning"
                    ? "bg-stock-due text-stock-due-ink ring-amber-200"
                    : "bg-stock-assigned text-stock-assigned-ink ring-sky-200";
              return (
                <Link
                  key={alert.id}
                  href="/capacitacion/campus/alertas"
                  className={`flex items-start gap-4 rounded-2xl px-5 py-3.5 ring-1 transition-transform hover:-translate-y-0.5 ${stock}`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{alert.title}</p>
                    <p className="truncate text-xs opacity-75">{alert.body}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {assignments.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-rule bg-white/70 px-6 py-12 text-center backdrop-blur-xl">
          <p className="font-display text-lg font-semibold text-ink">Sin asignaciones para tu celda</p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-ink-muted">
            No hay capacitaciones publicadas para tu sector, puesto y tarea. Si cambiaste de funcion,
            edita el perfil o consulta al capacitador.
          </p>
        </section>
      ) : (
        <CampusAssignmentBoard items={boardItems} />
      )}
    </div>
  );
}
