import Link from "next/link";
import { Award, CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import { CertificateDownloadButton } from "@/components/capacitacion/CertificateDownloadButton";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  not_started: {
    label: "Sin iniciar",
    className: "bg-gray-100 text-brand-gray ring-gray-200",
    icon: CircleDashed,
  },
  in_progress: {
    label: "En progreso",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: CircleDashed,
  },
  completed: {
    label: "Aprobada",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },
  failed: {
    label: "No aprobada",
    className: "bg-red-50 text-red-700 ring-red-200",
    icon: XCircle,
  },
};

type Props = {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  status?: string;
  score?: number | null;
};

export function TrainingCard({
  id,
  title,
  description,
  coverImage,
  status = "not_started",
  score,
}: Props) {
  const config = statusConfig[status] ?? statusConfig.not_started;
  const StatusIcon = config.icon;
  const completed = status === "completed";

  const thumb = coverImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coverImage}
      alt=""
      className="h-14 w-20 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
    />
  ) : (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
        completed
          ? "bg-emerald-600 text-white"
          : "bg-brand-red/10 text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white"
      }`}
    >
      {completed ? <Award className="h-5 w-5" /> : <StatusIcon className="h-5 w-5" />}
    </div>
  );

  if (completed) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-white to-emerald-50/40 p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {thumb}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-brand-dark">{title}</h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${config.className}`}
              >
                <StatusIcon className="h-3 w-3" />
                {config.label}
                {score != null && ` · ${score}%`}
              </span>
            </div>
            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-brand-gray">{description}</p>
            )}
            <p className="mt-2 text-xs font-medium text-emerald-700">
              Curso finalizado. Podés ver y descargar tu certificado.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`/capacitacion/campus/capacitacion/${id}`}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Ver certificado
          </Link>
          <CertificateDownloadButton
            trainingId={id}
            trainingTitle={title}
            label="Descargar PDF"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/capacitacion/campus/capacitacion/${id}`}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-red/20 hover:shadow-lg"
    >
      {thumb}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-brand-dark transition-colors group-hover:text-brand-red">
            {title}
          </h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${config.className}`}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
            {score != null && ` · ${score}%`}
          </span>
        </div>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-brand-gray">{description}</p>
        )}
      </div>

      <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-red sm:inline-flex">
        Ingresar →
      </span>
    </Link>
  );
}
