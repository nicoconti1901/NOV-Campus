import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, BookOpen } from "lucide-react";
import { getRoomTheme } from "@/lib/capacitacion/rooms";

type Props = {
  slug: string;
  name: string;
  trainingCount: number;
  completedCount?: number;
};

export function RoomCard({ slug, name, trainingCount, completedCount = 0 }: Props) {
  const theme = getRoomTheme(slug);
  const Icon = theme.icon;
  const progressPct =
    trainingCount > 0 ? Math.round((completedCount / trainingCount) * 100) : 0;

  return (
    <Link
      href={`/capacitacion/campus/sala/${slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white/80 ring-1 ring-slate-200/80 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(15,23,42,0.45)] ${theme.ring}`}
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={theme.coverImage}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className={`absolute inset-0 bg-linear-to-t ${theme.overlay} opacity-90`} />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />

        {/* Hairline accent top */}
        <div className={`absolute inset-x-0 top-0 h-0.5 ${theme.accentBg} opacity-70`} />

        <div className="absolute inset-0 flex flex-col justify-between p-5">
          {/* Icon + badge */}
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/40 backdrop-blur-sm">
              <Icon className={`h-5 w-5 ${theme.coverAccent}`} />
            </div>
            <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
              {trainingCount} curso{trainingCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-display text-base font-semibold uppercase tracking-[0.04em] text-white drop-shadow-sm sm:text-lg">
              {name}
            </h3>
            <p className="mt-1 text-xs text-white/75">{theme.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-1 flex-col border-t border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm">
        {/* Progress bar */}
        {trainingCount > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em]">
              <span className="text-ink-muted">Progreso</span>
              <span className={theme.accent}>{progressPct}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-paper-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${theme.accentBg}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {completedCount > 0 && (
          <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-stock-valid px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-stock-valid-ink">
            <Award className="h-3 w-3" />
            {completedCount} aprobada{completedCount !== 1 ? "s" : ""}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] ${theme.accent}`}>
            <BookOpen className="h-3.5 w-3.5" />
            Ingresar a la sala
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.accentBg} transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-110`}
          >
            <ArrowRight className="h-3.5 w-3.5 text-white" />
          </span>
        </div>
      </div>
    </Link>
  );
}
