"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import {
  formDashedBtnClass,
  formFieldClass,
  formHintClass,
  formLabelClass,
  formPanelClass,
  formPanelTitleClass,
  formSecondaryBtnClass,
} from "@/lib/capacitacion/form-styles";

type Room = { id: string; name: string; slug: string };
type Master = { id: string; name: string };
type Option = { text: string; isCorrect: boolean };
type Question = { text: string; options: Option[] };
type Material = { type: "video" | "file"; title: string; fileUrl: string; fileName?: string };

type TrainingData = {
  title: string;
  description: string;
  coverImage: string | null;
  roomId: string;
  minPassScore: number;
  published: boolean;
  validityDays: number;
  sedeId: string;
  puestoId: string;
  tareaId: string;
  materials: Material[];
  questions: Question[];
};

type Props = {
  rooms: Room[];
  directory: { sedes: Master[]; puestos: Master[]; tareas: Master[] };
  initial?: Partial<TrainingData> & { id?: string };
};

const emptyQuestion = (): Question => ({
  text: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
});

export function TrainingForm({ rooms, directory, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState<TrainingData>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    coverImage: initial?.coverImage ?? null,
    roomId: initial?.roomId ?? rooms[0]?.id ?? "",
    minPassScore: initial?.minPassScore ?? 70,
    published: initial?.published ?? false,
    validityDays: initial?.validityDays ?? 365,
    sedeId: initial?.sedeId ?? directory.sedes[0]?.id ?? "",
    puestoId: initial?.puestoId ?? directory.puestos[0]?.id ?? "",
    tareaId: initial?.tareaId ?? directory.tareas[0]?.id ?? "",
    materials: initial?.materials ?? [],
    questions: initial?.questions?.length ? initial.questions : [emptyQuestion()],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  async function uploadFile(file: File, onProgress?: (pct: number) => void) {
    const chunkSize = 4 * 1024 * 1024; // 4 MB — requests cortos evitan 408
    const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));
    const uploadId = `up_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);

      let lastError: Error | null = null;
      let done = false;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const fd = new FormData();
          fd.append("chunk", blob, file.name);
          fd.append("uploadId", uploadId);
          fd.append("chunkIndex", String(chunkIndex));
          fd.append("totalChunks", String(totalChunks));
          fd.append("totalSize", String(file.size));
          fd.append("fileName", file.name);
          if (file.type) fd.append("mime", file.type);

          const res = await fetch("/api/upload/chunk", { method: "POST", body: fd });
          const data = (await res.json().catch(() => null)) as
            | { error?: string; url?: string; fileName?: string }
            | null;

          if (!res.ok) {
            throw new Error(data?.error || `Error al subir (parte ${chunkIndex + 1}/${totalChunks})`);
          }

          onProgress?.(Math.round(((chunkIndex + 1) / totalChunks) * 100));

          if (data?.url && data.fileName) {
            return { url: data.url, fileName: data.fileName };
          }

          done = true;
          lastError = null;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("Error de red");
          if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }

      if (!done && lastError) throw lastError;
    }

    throw new Error("No se recibió confirmación final del archivo");
  }

  async function handleMaterialUpload(e: React.ChangeEvent<HTMLInputElement>, type: "video" | "file") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const uploaded = await uploadFile(file, setUploadProgress);
      setForm((f) => ({
        ...f,
        materials: [
          ...f.materials,
          { type, title: uploaded.fileName, fileUrl: uploaded.url, fileName: uploaded.fileName },
        ],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el archivo");
    }
    setUploading(false);
    setUploadProgress(null);
    e.target.value = "";
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError("");
    try {
      const uploaded = await uploadFile(file);
      setForm((f) => ({ ...f, coverImage: uploaded.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen del curso");
    }
    setUploadingCover(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/admin/trainings/${initial!.id}` : "/api/admin/trainings";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        scope: {
          sedeId: form.sedeId,
          puestoId: form.puestoId,
          tareaId: form.tareaId,
          validityDays: form.validityDays,
        },
      }),
    });

    if (res.ok) {
      router.push("/capacitacion/admin/capacitaciones");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!initial?.id) return;
    if (
      !confirm(
        "¿Eliminar esta capacitación con todo su material y evaluación? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/admin/trainings/${initial.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/capacitacion/admin/capacitaciones");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "No se pudo eliminar");
      setDeleting(false);
    }
  }

  const fieldClass = formFieldClass;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-ink">
      <section className={formPanelClass}>
        <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-navy via-brand-red to-teal-500" />
        <h3 className={formPanelTitleClass}>Datos generales</h3>
        <div className="mt-4 space-y-4">
          <div data-tour="training-basics" className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={formLabelClass}>Título</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={formLabelClass}>Descripción</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={formLabelClass}>Imagen representativa del curso</label>
              <p className={`mb-3 ${formHintClass}`}>
                Opcional. Se muestra al alumno y reemplaza la imagen de la sala en el certificado.
              </p>
              {form.coverImage ? (
                <div className="flex flex-wrap items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.coverImage}
                    alt="Portada del curso"
                    className="h-28 w-44 rounded-xl object-cover ring-1 ring-white/15"
                  />
                  <div className="flex flex-col gap-2">
                    <label className={formDashedBtnClass}>
                      <Upload className="h-4 w-4" />
                      Cambiar imagen
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, coverImage: null })}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red"
                    >
                      <Trash2 className="h-4 w-4" />
                      Quitar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <label className={formDashedBtnClass}>
                  <ImageIcon className="h-4 w-4" />
                  {uploadingCover ? "Subiendo..." : "Subir imagen del curso"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                  />
                </label>
              )}
            </div>
          </div>

          <div data-tour="training-rules-block" className="grid gap-4 sm:grid-cols-2">
            <div data-tour="training-rules-sala">
              <label className={formLabelClass}>Sala</label>
              <select
                required
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                className={fieldClass}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div data-tour="training-rules-score">
              <label className={formLabelClass}>
                Puntaje mínimo de aprobación (%)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={form.minPassScore}
                onChange={(e) => setForm({ ...form, minPassScore: Number(e.target.value) })}
                className={fieldClass}
              />
            </div>
            <div data-tour="training-rules-validity" className="sm:col-span-2 sm:max-w-xs">
              <label className={formLabelClass}>Vigencia (días)</label>
              <input
                type="number"
                min={1}
                max={3650}
                required
                value={form.validityDays}
                onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}
                className={fieldClass}
              />
            </div>
          </div>

          <div data-tour="training-scope-block" className="grid gap-4 sm:grid-cols-2">
            <div data-tour="training-scope">
              <label className={formLabelClass}>Sector / sede</label>
              <select
                required
                value={form.sedeId}
                onChange={(e) => setForm({ ...form, sedeId: e.target.value })}
                className={fieldClass}
              >
                {directory.sedes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div data-tour="training-scope-puesto">
              <label className={formLabelClass}>Puesto</label>
              <select
                required
                value={form.puestoId}
                onChange={(e) => setForm({ ...form, puestoId: e.target.value })}
                className={fieldClass}
              >
                {directory.puestos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div data-tour="training-scope-tarea">
              <label className={formLabelClass}>Tarea</label>
              <select
                required
                value={form.tareaId}
                onChange={(e) => setForm({ ...form, tareaId: e.target.value })}
                className={fieldClass}
              >
                {directory.tareas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className={formHintClass} data-tour="training-scope-hint">
            El alcance es obligatorio. La capacitación impacta solo a alumnos de esa celda (puesto × tarea × sede).
          </p>

          <label
            data-tour="training-publish"
            className="flex items-center gap-2 text-sm text-ink-muted"
          >
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publicar capacitación (visible para alumnos)
          </label>
        </div>
      </section>

      <section className={formPanelClass}>
        <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-navy via-brand-red to-teal-500" />
        <h3 className={formPanelTitleClass}>Material didáctico</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className={formDashedBtnClass}>
            <Upload className="h-4 w-4" />
            Subir video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleMaterialUpload(e, "video")}
            />
          </label>
          <label className={formDashedBtnClass}>
            <Upload className="h-4 w-4" />
            Subir archivo
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleMaterialUpload(e, "file")}
            />
          </label>
          {uploading && (
            <span className={`text-sm ${formHintClass}`}>
              Subiendo{uploadProgress != null ? `… ${uploadProgress}%` : "…"}
              {uploadProgress != null && uploadProgress < 100
                ? " (no cierres la pestaña)"
                : ""}
            </span>
          )}
          {uploading && uploadProgress != null && (
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-red transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
        <ul className="mt-4 space-y-2">
          {form.materials.map((m, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-xl border border-rule bg-paper-muted px-4 py-2.5 text-sm text-ink-muted"
            >
              <span>
                {m.type === "video" ? "🎬" : "📄"} {m.title}
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, materials: form.materials.filter((_, idx) => idx !== i) })
                }
                className="text-brand-red"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={formPanelClass}>
        <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-brand-navy via-brand-red to-teal-500" />
        <div className="flex items-center justify-between">
          <h3 className={formPanelTitleClass}>Evaluación (opción múltiple)</h3>
          <button
            type="button"
            onClick={() => setForm({ ...form, questions: [...form.questions, emptyQuestion()] })}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red"
          >
            <Plus className="h-4 w-4" /> Agregar pregunta
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {form.questions.map((q, qi) => (
            <div key={qi} className="rounded-xl border border-rule bg-paper-muted p-4">
              <div className="flex items-start justify-between gap-3">
                <input
                  required
                  placeholder={`Pregunta ${qi + 1}`}
                  value={q.text}
                  onChange={(e) => {
                    const questions = [...form.questions];
                    questions[qi] = { ...q, text: e.target.value };
                    setForm({ ...form, questions });
                  }}
                  className={fieldClass}
                />
                {form.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, questions: form.questions.filter((_, i) => i !== qi) })
                    }
                    className="text-brand-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={opt.isCorrect}
                      onChange={() => {
                        const questions = [...form.questions];
                        questions[qi].options = q.options.map((o, i) => ({
                          ...o,
                          isCorrect: i === oi,
                        }));
                        setForm({ ...form, questions });
                      }}
                    />
                    <input
                      required
                      placeholder={`Opción ${oi + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const questions = [...form.questions];
                        const options = [...q.options];
                        options[oi] = { ...opt, text: e.target.value };
                        questions[qi] = { ...q, options };
                        setForm({ ...form, questions });
                      }}
                      className={fieldClass}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const questions = [...form.questions];
                          questions[qi].options = q.options.filter((_, i) => i !== oi);
                          setForm({ ...form, questions });
                        }}
                        className="text-ink-muted"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const questions = [...form.questions];
                    questions[qi].options.push({ text: "", isCorrect: false });
                    setForm({ ...form, questions });
                  }}
                  className="text-xs font-semibold text-brand-red"
                >
                  + Agregar opción
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-brand-red">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || deleting}
          className="rounded-xl bg-brand-red px-6 py-3 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear capacitación"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className={`${formSecondaryBtnClass} border-brand-red/40 text-brand-red hover:border-brand-red hover:bg-brand-red/10`}
          >
            <Trash2 className="mr-2 inline h-4 w-4" />
            {deleting ? "Eliminando..." : "Eliminar capacitación"}
          </button>
        )}
      </div>
    </form>
  );
}
