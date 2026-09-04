import { AlertTriangle, Bell, Info, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentPage } from "@/lib/capacitacion/auth-guards";

type Severity = "info" | "warning" | "danger";

const SEVERITY_META: Record<Severity, {
  label: string;
  icon: React.ElementType;
  sheet: string;
  stamp: string;
}> = {
  info: {
    label: "Informativa",
    icon: Info,
    sheet: "bg-stock-assigned text-stock-assigned-ink ring-sky-200",
    stamp: "INFORMATIVA",
  },
  warning: {
    label: "Advertencia",
    icon: AlertTriangle,
    sheet: "bg-stock-due text-stock-due-ink ring-amber-200",
    stamp: "POR ATENDER",
  },
  danger: {
    label: "Peligro",
    icon: ShieldAlert,
    sheet: "bg-stock-expired text-stock-expired-ink ring-red-200",
    stamp: "URGENTE",
  },
};

export default async function CampusAlertasPage() {
  await requireStudentPage();

  const now = new Date();
  const alerts = await prisma.alert.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ severity: "desc" }, { publishedAt: "desc" }],
  });

  const danger = alerts.filter((a) => a.severity === "danger");
  const warning = alerts.filter((a) => a.severity === "warning");
  const info = alerts.filter((a) => a.severity === "info");
  const ordered = [...danger, ...warning, ...info];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-white/80 ring-1 ring-slate-200/80 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl">
        <div className="px-5 py-6 sm:px-7">
          <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-3xl">
            Alertas activas
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Comunicaciones del equipo HSE. Lee cada alerta con atención.
          </p>
        </div>

        {alerts.length > 0 && (
          <dl className="grid border-t border-slate-200/80 sm:grid-cols-3">
            <div className="bg-stock-expired px-5 py-4 text-stock-expired-ink">
              <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.12em]">Urgente</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">{danger.length}</dd>
            </div>
            <div className="bg-stock-due px-5 py-4 text-stock-due-ink sm:border-l sm:border-amber-200/70">
              <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.12em]">Por atender</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">{warning.length}</dd>
            </div>
            <div className="bg-stock-assigned px-5 py-4 text-stock-assigned-ink sm:border-l sm:border-sky-200/70">
              <dt className="font-display text-[11px] font-semibold uppercase tracking-[0.12em]">Informativa</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">{info.length}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* Alerts list */}
      {ordered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-rule py-20 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-ink-muted" />
          <p className="text-base font-medium text-ink-muted">Sin alertas activas</p>
          <p className="mt-1 text-sm text-ink-muted">
            No hay comunicaciones pendientes en este momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordered.map((alert) => {
            const meta = SEVERITY_META[alert.severity as Severity] ?? SEVERITY_META.info;
            const SeverityIcon = meta.icon;
            return (
              <div
                key={alert.id}
                className={`rounded-2xl px-5 py-4 ring-1 ${meta.sheet}`}
              >
                <div className="flex gap-4">
                  <SeverityIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{alert.title}</h3>
                      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em]">
                        {meta.stamp}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{alert.body}</p>
                    <p className="mt-3 text-[11px] text-ink-muted">
                      Publicada el{" "}
                      {new Date(alert.publishedAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {alert.expiresAt && (
                        <>
                          {" · "}Vence el{" "}
                          {new Date(alert.expiresAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
