"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Plus, Trash2, Upload } from "lucide-react";

type Room = { id: string; name: string; slug: string };

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
  materials: Material[];
  questions: Question[];
};

type Props = {
  rooms: Room[];
  initial?: Partial<TrainingData> & { id?: string };
};

const emptyQuestion = (): Question => ({
  text: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
});

export function TrainingForm({ rooms, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState<TrainingData>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    coverImage: initial?.coverImage ?? null,
    roomId: initial?.roomId ?? rooms[0]?.id ?? "",
    minPassScore: initial?.minPassScore ?? 70,
    published: initial?.published ?? false,
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
      body: JSON.stringify(form),
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

  const fieldClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-brand-dark caret-brand-dark outline-none placeholder:text-brand-gray-light focus:border-brand-red focus:ring-2 focus:ring-brand-red/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-brand-dark">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="font-bold text-brand-dark">Datos generales</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-dark">Título</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-dark">Descripción</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={fieldClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Imagen representativa del curso</label>
            <p className="mb-3 text-xs text-brand-gray">
              Opcional. Se muestra al alumno y reemplaza la imagen de la sala en el certificado.
            </p>
            {form.coverImage ? (
              <div className="flex flex-wrap items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImage}
                  alt="Portada del curso"
                  className="h-28 w-44 rounded-xl object-cover ring-1 ring-gray-200"
                />
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm hover:border-brand-red">
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
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm hover:border-brand-red">
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

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Sala</label>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">
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
          <label className="flex items-center gap-2 text-sm text-brand-dark sm:col-span-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publicar capacitación (visible para alumnos)
          </label>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="font-bold text-brand-dark">Material didáctico</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm hover:border-brand-red">
            <Upload className="h-4 w-4" />
            Subir video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleMaterialUpload(e, "video")}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm hover:border-brand-red">
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
            <span className="text-sm text-brand-gray">
              Subiendo{uploadProgress != null ? `… ${uploadProgress}%` : "…"}
              {uploadProgress != null && uploadProgress < 100
                ? " (no cierres la pestaña)"
                : ""}
            </span>
          )}
          {uploading && uploadProgress != null && (
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
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
              className="flex items-center justify-between rounded-lg bg-brand-gray-bg px-4 py-2 text-sm"
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

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-brand-dark">Evaluación (opción múltiple)</h3>
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
            <div key={qi} className="rounded-lg border border-gray-100 p-4">
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
                        className="text-brand-gray"
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
          className="rounded-lg bg-brand-red px-6 py-3 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear capacitación"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-6 py-3 text-sm font-semibold text-brand-red hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Eliminando..." : "Eliminar capacitación"}
          </button>
        )}
      </div>
    </form>
  );
}
