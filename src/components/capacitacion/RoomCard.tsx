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
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white/95 shadow-xl ring-1 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${theme.ring}`}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={theme.coverImage}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlay}`} />

        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-lg backdrop-blur-md">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
              {trainingCount} curso{trainingCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm sm:text-2xl">
              {name}
            </h3>
            <p className="mt-1 text-sm text-white/80">{theme.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {trainingCount > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-brand-gray">
              <span>Progreso en la sala</span>
              <span className={theme.accent}>{progressPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${theme.accentBg}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {completedCount > 0 && (
          <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <Award className="h-3.5 w-3.5" />
            {completedCount} aprobada{completedCount !== 1 ? "s" : ""}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
            <BookOpen className={`h-4 w-4 ${theme.accent}`} />
            Ingresar a la sala
          </span>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110 ${theme.accentBg}`}
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
