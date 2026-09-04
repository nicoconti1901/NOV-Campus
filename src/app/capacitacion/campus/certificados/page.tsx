import Link from "next/link";
import { Award, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentPage } from "@/lib/capacitacion/auth-guards";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { getRoomTheme } from "@/lib/capacitacion/rooms";
import { CertificateDownloadButton } from "@/components/capacitacion/CertificateDownloadButton";

export default async function CertificadosPage() {
  const session = await requireStudentPage();

  const certificates = await prisma.trainingProgress.findMany({
    where: {
      studentId: session.studentId,
      status: PROGRESS_STATUS.COMPLETED,
    },
    include: {
      training: {
        include: { room: true },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div>
      <Link
        href="/capacitacion/campus"
        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-1.5 text-sm font-medium text-brand-gray shadow-sm border border-black/8 backdrop-blur-sm transition-colors hover:text-brand-red"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a salas
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white/80 ring-1 ring-slate-200/80 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur-xl">
        <div className="relative bg-stock-valid px-6 py-7 text-stock-valid-ink sm:px-8">
          <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400 to-teal-500" />
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 ring-1 ring-emerald-200">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Historial
              </p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Mis certificados</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {certificates.length === 0
                  ? "Todavía no tenés certificados emitidos"
                  : `${certificates.length} certificado${certificates.length !== 1 ? "s" : ""} disponible${certificates.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6 sm:p-8">
          {certificates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-12 text-center">
              <Award className="mx-auto h-10 w-10 text-brand-gray-light" />
              <p className="mt-3 font-medium text-brand-dark">Sin certificados aún</p>
              <p className="mt-1 text-sm text-brand-gray">
                Cuando apruebes una capacitación, tu certificado aparecerá acá.
              </p>
              <Link
                href="/capacitacion/campus"
                className="mt-5 inline-flex rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
              >
                Ir a mis salas
              </Link>
            </div>
          ) : (
            certificates.map((item) => {
              const theme = getRoomTheme(item.training.room.slug);
              const RoomIcon = theme.icon;
              const dateStr = item.completedAt
                ? item.completedAt.toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Sin fecha";

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-brand-gray-bg/40 p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-ink ${theme.accentBg}`}
                  >
                    <RoomIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accent}`}>
                      {item.training.room.name}
                    </p>
                    <h3 className="mt-0.5 font-bold text-brand-dark">{item.training.title}</h3>
                    <p className="mt-1 text-sm text-brand-gray">
                      Aprobado el {dateStr}
                      {item.score != null && ` · Puntaje ${item.score}%`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/capacitacion/campus/capacitacion/${item.trainingId}`}
                      className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-surface-card px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand-gray-bg"
                    >
                      Ver
                    </Link>
                    <CertificateDownloadButton
                      trainingId={item.trainingId}
                      trainingTitle={item.training.title}
                      label="Descargar PDF"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
