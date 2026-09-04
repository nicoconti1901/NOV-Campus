"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Lock,
  PlayCircle,
} from "lucide-react";
import { allMaterialsViewed } from "@/lib/capacitacion/materials";
import { getRoomTheme } from "@/lib/capacitacion/rooms";
import { CertificateDownloadButton } from "@/components/capacitacion/CertificateDownloadButton";
import { MaterialVideoPlayer } from "@/components/capacitacion/MaterialVideoPlayer";

type Material = { id: string; type: string; title: string; fileUrl: string };
type Option = { id: string; text: string };
type Question = { id: string; text: string; options: Option[] };
type Training = {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  minPassScore: number;
  materials: Material[];
  questions: Question[];
  room: { name: string; slug: string };
  materialsViewed: string[];
  progressStatus: string;
  progressScore: number | null;
  assignmentStatus?: string;
};

export function TrainingViewer() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; minPassScore: number } | null>(null);
  const [activeStep, setActiveStep] = useState<"materials" | "quiz">("materials");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadTraining = useCallback(async () => {
    const res = await fetch(`/api/campus/trainings/${id}`);
    const data = await res.json();
    if (res.ok) {
      setTraining(data);
      setViewedIds(data.materialsViewed ?? []);
      if (data.progressStatus === "completed" && data.assignmentStatus !== "expired") {
        setResult({
          score: data.progressScore ?? 0,
          passed: true,
          minPassScore: data.minPassScore,
        });
      }
      const materialIds = (data.materials ?? []).map((m: Material) => m.id);
      if (allMaterialsViewed(materialIds, data.materialsViewed ?? [])) {
        setActiveStep("quiz");
      }
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadTraining();
  }, [loadTraining]);

  const materialIds = useMemo(
    () => training?.materials.map((m) => m.id) ?? [],
    [training]
  );
  const materialsComplete = allMaterialsViewed(materialIds, viewedIds);
  const isCompleted =
    (training?.progressStatus === "completed" && training.assignmentStatus !== "expired") ||
    Boolean(result?.passed);

  async function markViewed(materialId: string) {
    if (viewedIds.includes(materialId)) return;
    const res = await fetch(`/api/campus/trainings/${id}/materials/${materialId}/view`, {
      method: "POST",
    });
    if (res.ok) {
      const data = await res.json();
      setViewedIds(data.viewed);
    }
  }

  async function submitQuiz(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/campus/trainings/${id}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
      if (data.passed) {
        setTraining((prev) =>
          prev ? { ...prev, progressStatus: "completed", progressScore: data.score } : prev
        );
      }
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al enviar evaluación");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
      </div>
    );
  }

  if (!training) {
    return <p className="text-sm text-brand-red">Capacitación no encontrada</p>;
  }

  const theme = getRoomTheme(training.room.slug);
  const RoomIcon = theme.icon;
  const heroImage = training.coverImage || theme.coverImage;

  if (isCompleted) {
    const score = result?.score ?? training.progressScore ?? 0;
    return (
      <div>
        <nav className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-xl border border-black/10 bg-surface px-3 py-2 text-sm text-brand-gray shadow-sm backdrop-blur-sm">
          <Link href="/capacitacion/campus" className="hover:text-brand-red">
            Mis salas
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/capacitacion/campus/certificados" className="hover:text-brand-red">
            Mis certificados
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-brand-dark">{training.title}</span>
        </nav>

        <div className="overflow-hidden border border-rule bg-paper-raised">
          <div className="bg-stock-valid px-6 py-8 text-stock-valid-ink sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-stock-valid-ink/20 bg-paper-raised">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">{training.title}</h2>
                <p className="mt-2 text-sm">VIGENTE · {training.room.name}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
              <p className="text-lg font-bold text-emerald-800">¡Felicitaciones, aprobaste!</p>
              <p className="mt-1 text-sm text-emerald-700">Tu puntaje: {score}%</p>
              <p className="mt-3 text-sm text-emerald-800/80">
                Esta capacitación ya está finalizada. Solo podés consultar y descargar tu
                certificado.
              </p>
              <div className="mt-5">
                <CertificateDownloadButton
                  trainingId={training.id}
                  trainingTitle={training.title}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/capacitacion/campus/certificados"
                className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-surface-card px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand-gray-bg"
              >
                <Award className="h-4 w-4 text-emerald-600" />
                Ver historial de certificados
              </Link>
              <Link
                href="/capacitacion/campus"
                className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-brand-gray hover:text-brand-red"
              >
                Volver a mis salas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-xl border border-black/10 bg-surface px-3 py-2 text-sm text-brand-gray shadow-sm backdrop-blur-sm">
        <Link href="/capacitacion/campus" className="hover:text-brand-red">
          Mis salas
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-brand-dark">{training.room.name}</span>
      </nav>

      <section className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-gray-100 sm:rounded-3xl">
        <div className="relative min-h-[220px] sm:min-h-[260px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.overlay}`} />
          <div className="relative flex h-full min-h-[220px] flex-col justify-end p-6 sm:min-h-[260px] sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
                <RoomIcon className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                  {training.room.name}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{training.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-white/85">{theme.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {training.description && (
          <div className="border-t border-rule bg-paper px-6 py-6 sm:px-8">
            <p className="max-w-3xl text-sm leading-relaxed text-ink">{training.description}</p>
          </div>
        )}
      </section>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveStep("materials")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${ activeStep === "materials" ? "border-brand-red text-brand-red" : "border-transparent text-brand-gray hover:text-brand-dark" }`}
        >
          <PlayCircle className="h-4 w-4" />
          Material didáctico
          {materialsComplete && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        </button>
        <button
          type="button"
          onClick={() => materialsComplete && setActiveStep("quiz")}
          disabled={!materialsComplete}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${ activeStep === "quiz" ? "border-brand-red text-brand-red" : materialsComplete ? "border-transparent text-brand-gray hover:text-brand-dark" : "cursor-not-allowed border-transparent text-gray-300" }`}
        >
          {!materialsComplete ? <Lock className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          Evaluación
        </button>
      </div>

      {activeStep === "materials" && (
        <section className="mt-6 space-y-6">
          {training.materials.length === 0 ? (
            <div className="rounded-2xl bg-surface p-8 text-center shadow-sm ring-1 ring-gray-100">
              <p className="text-brand-gray">Esta capacitación no tiene material didáctico.</p>
              <button
                type="button"
                onClick={() => setActiveStep("quiz")}
                className="mt-4 rounded-lg bg-brand-red px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
              >
                Ir a la evaluación
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Para desbloquear la evaluación debés revisar todo el material.
                {training.materials.some((m) => m.type === "video") &&
                  " Los videos deben reproducirse hasta el final."}
              </div>

              {training.materials.map((m, index) => {
                const viewed = viewedIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ${ viewed ? "ring-emerald-200" : "ring-gray-100" }`}
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray-bg text-sm font-bold text-brand-gray">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-brand-dark">{m.title}</h3>
                          <p className="text-xs text-brand-gray">
                            {m.type === "video" ? "Video" : "Documento"}
                          </p>
                        </div>
                      </div>
                      {viewed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completado
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      {m.type === "video" ? (
                        <MaterialVideoPlayer
                          src={m.fileUrl}
                          title={m.title}
                          onEnded={() => markViewed(m.id)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            window.open(m.fileUrl, "_blank", "noopener,noreferrer");
                            markViewed(m.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-brand-gray-bg px-5 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-gray-200"
                        >
                          <FileText className="h-4 w-4" />
                          Abrir y revisar material
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-between rounded-xl border border-rule bg-paper-raised px-5 py-4">
                <p className="text-sm text-ink-muted">
                  Progreso: {viewedIds.filter((vid) => materialIds.includes(vid)).length} de{" "}
                  {materialIds.length} materiales
                </p>
                <button
                  type="button"
                  disabled={!materialsComplete}
                  onClick={() => setActiveStep("quiz")}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuar a evaluación
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {activeStep === "quiz" && (
        <section className="mt-6 overflow-hidden border border-rule bg-paper-raised">
          <div className="border-b border-rule bg-paper px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <ClipboardList className="h-6 w-6 shrink-0 text-ink" />
              <div>
                <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">Evaluación final</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Puntaje mínimo para aprobar:{" "}
                  <span className="font-semibold text-ink">{training.minPassScore}%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {result ? (
              <div className="border border-rule bg-stock-expired p-6 text-stock-expired-ink">
                <div className="flex items-start gap-4">
                  <FileText className="h-10 w-10 shrink-0" />
                  <div>
                    <p className="text-lg font-semibold">
                      No alcanzaste el puntaje mínimo
                    </p>
                    <p className="mt-1 text-sm">Tu puntaje: {result.score}%</p>
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="mt-4 text-sm font-semibold underline"
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submitQuiz} className="space-y-6">
                {training.questions.map((q, i) => (
                  <fieldset
                    key={q.id}
                    className="overflow-hidden border border-rule bg-paper" 
                  >
                    <div className="px-5 py-4">
                      <legend className="text-sm font-bold text-ink">
                        <span
                          className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-ink ${theme.accentBg}`}
                        >
                          {i + 1}
                        </span>
                        {q.text}
                      </legend>
                    </div>
                    <div className="space-y-2 px-5 pb-4">
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex cursor-pointer items-center gap-3 border px-4 py-3.5 text-sm transition-colors ${
                              selected
                                ? "border-brand-red bg-stock-expired/60 font-medium text-ink"
                                : "border-rule bg-paper-raised text-ink hover:bg-paper-muted"
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              required
                              value={opt.id}
                              checked={selected}
                              onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                              className="accent-brand-red"
                            />
                            {opt.text}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
                {error && <p className="text-sm text-brand-red">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-red px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-red-dark disabled:opacity-60" 
                >
                  {submitting ? "Enviando..." : "Enviar evaluación"}
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
