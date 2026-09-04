"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  Award,
  Building2,
  CheckCircle2,
  CircleDashed,
  Download,
  Eye,
  FileUp,
  IdCard,
  Mail,
  Pencil,
  Phone,
  Power,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  XCircle,
} from "lucide-react";
import { getRoomTheme } from "@/lib/capacitacion/rooms";

type StudentSummary = {
  dni: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  company: string | null;
  profileCompleted: boolean;
};

type SearchResult = {
  id: string;
  dni: string;
  enabled: boolean;
  createdAt: string;
  student: StudentSummary | null;
};

type ProgressItem = {
  id: string;
  status: string;
  score: number | null;
  completedAt: string | null;
  training: { title: string; room: { name: string; slug: string } };
};

type Student = {
  id: string;
  dni: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  sedeId: string | null;
  puestoId: string | null;
  tareaId: string | null;
  sede: { id: string; name: string } | null;
  puesto: { id: string; name: string } | null;
  tarea: { id: string; name: string } | null;
  profileCompleted: boolean;
  progress: ProgressItem[];
};

const statusConfig: Record<
  string,
  { label: string; bar: string; badge: string; icon: typeof CheckCircle2; tone: string }
> = {
  not_started: {
    label: "Sin iniciar",
    bar: "bg-white/30",
    badge: "bg-paper-muted text-ink ring-rule",
    icon: CircleDashed,
    tone: "border-rule",
  },
  in_progress: {
    label: "En progreso",
    bar: "bg-amber-400/80",
    badge: "bg-stock-due text-stock-due-ink",
    icon: CircleDashed,
    tone: "border-rule",
  },
  completed: {
    label: "Aprobada",
    bar: "bg-emerald-500/80",
    badge: "bg-stock-valid text-stock-valid-ink",
    icon: CheckCircle2,
    tone: "border-l-emerald-500/70",
  },
  failed: {
    label: "No aprobada",
    bar: "bg-brand-red-dark",
    badge: "bg-brand-red/15 text-red-300 ring-brand-red/25",
    icon: XCircle,
    tone: "border-l-brand-red-dark",
  },
};

function progressPercent(status: string, score: number | null) {
  if (status === "completed") return score ?? 100;
  if (status === "failed") return Math.max(score ?? 15, 10);
  if (status === "in_progress") return Math.max(score ?? 40, 25);
  return 10;
}

function fullName(student: { firstName: string | null; lastName: string | null } | null) {
  if (!student) return null;
  const name = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
  return name || null;
}

export function AlumnosManager() {
  const [newDni, setNewDni] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [studentMessage, setStudentMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    dni: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    sedeId: "",
    puestoId: "",
    tareaId: "",
    profileCompleted: false,
  });
  const [directory, setDirectory] = useState<{
    sedes: { id: string; name: string }[];
    puestos: { id: string; name: string }[];
    tareas: { id: string; name: string }[];
  }>({ sedes: [], puestos: [], tareas: [] });
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingDniId, setEditingDniId] = useState<string | null>(null);
  const [editDniValue, setEditDniValue] = useState("");
  const [importingCsv, setImportingCsv] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/directory")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDirectory(data);
      })
      .catch(() => undefined);
  }, []);

  async function importCsv(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingCsv(true);
    setError("");
    setSuccess("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/allowed-dnis/import", { method: "POST", body: fd });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      setSuccess(
        `Importación OK: ${data.created} nuevos, ${data.reenabled} rehabilitados, ${data.skipped} ya existentes (${data.total} válidos).`
      );
      if (searched) {
        await searchDnis(undefined, { all: true });
      }
    } else {
      setError(data?.error ?? "No se pudo importar el CSV");
    }
    setImportingCsv(false);
    e.target.value = "";
  }

  async function exportProgress() {
    setExporting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/progress/export");
      if (!res.ok) {
        setError("No se pudo exportar el progreso");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "progreso-alumnos.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("No se pudo exportar el progreso");
    } finally {
      setExporting(false);
    }
  }

  async function addDni(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/allowed-dnis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: newDni }),
    });
    if (res.ok) {
      setNewDni("");
      setSuccess("DNI habilitado correctamente.");
    } else {
      const data = await res.json();
      setError(data.error ?? "Error al agregar DNI");
    }
  }

  async function searchDnis(e?: FormEvent, options?: { all?: boolean }) {
    e?.preventDefault();
    setSearching(true);
    setError("");
    setSelectedStudent(null);
    setStudentMessage("");
    setEditingProfile(false);
    setSearched(true);

    const q = searchQuery.trim();
    const listAll = options?.all === true;

    if (!listAll && !q) {
      setResults([]);
      setSearching(false);
      return;
    }

    const url = listAll
      ? "/api/admin/allowed-dnis?all=1"
      : `/api/admin/allowed-dnis?q=${encodeURIComponent(q)}`;

    const res = await fetch(url);
    if (res.ok) {
      setResults(await res.json());
    } else {
      setError("No se pudo buscar DNIs");
      setResults([]);
    }
    setSearching(false);
  }

  async function removeDni(id: string) {
    if (!confirm("¿Quitar este DNI de la lista de habilitados?")) return;
    await fetch(`/api/admin/allowed-dnis/${id}`, { method: "DELETE" });
    setResults((prev) => prev.filter((d) => d.id !== id));
    if (selectedStudent) setSelectedStudent(null);
  }

  async function toggleDni(id: string, enabled: boolean) {
    const res = await fetch(`/api/admin/allowed-dnis/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResults((prev) => prev.map((d) => (d.id === id ? { ...d, enabled: updated.enabled } : d)));
    }
  }

  async function saveDniEdit(id: string) {
    const res = await fetch(`/api/admin/allowed-dnis/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dni: editDniValue }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResults((prev) =>
        prev.map((d) => (d.id === id ? { ...d, dni: updated.dni, student: d.student } : d))
      );
      setEditingDniId(null);
    } else {
      const data = await res.json();
      setError(data.error ?? "No se pudo editar el DNI");
    }
  }

  async function viewStudent(dni: string) {
    setLoadingStudent(true);
    setStudentMessage("");
    setSelectedStudent(null);
    setEditingProfile(false);

    const res = await fetch(`/api/admin/students?dni=${encodeURIComponent(dni)}`);
    if (res.ok) {
      const students: Student[] = await res.json();
      if (students.length === 0) {
        setStudentMessage("Este DNI está habilitado, pero el alumno aún no ingresó al campus.");
      } else {
        const student = students[0];
        setSelectedStudent(student);
        setProfileForm({
          dni: student.dni,
          firstName: student.firstName ?? "",
          lastName: student.lastName ?? "",
          email: student.email ?? "",
          phone: student.phone ?? "",
          company: student.company ?? "",
          sedeId: student.sedeId ?? "",
          puestoId: student.puestoId ?? "",
          tareaId: student.tareaId ?? "",
          profileCompleted: student.profileCompleted,
        });
      }
    } else {
      setStudentMessage("No se pudieron cargar los datos del alumno.");
    }
    setLoadingStudent(false);
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setSavingProfile(true);
    setError("");

    const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profileForm,
        email: profileForm.email || null,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setSelectedStudent(updated);
      setEditingProfile(false);
      setSuccess("Datos del alumno actualizados.");
      setResults((prev) =>
        prev.map((r) =>
          r.dni === selectedStudent.dni || r.dni === updated.dni
            ? {
                ...r,
                dni: updated.dni,
                student: {
                  dni: updated.dni,
                  firstName: updated.firstName,
                  lastName: updated.lastName,
                  email: updated.email,
                  company: updated.company,
                  profileCompleted: updated.profileCompleted,
                },
              }
            : r
        )
      );
    } else {
      const data = await res.json();
      setError(data.error ?? "No se pudo actualizar el alumno");
    }
    setSavingProfile(false);
  }

  async function deleteStudent() {
    if (!selectedStudent) return;
    if (
      !confirm(
        `¿Eliminar al alumno ${fullName(selectedStudent) ?? selectedStudent.dni}? Se borrará su progreso.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/students/${selectedStudent.id}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedStudent(null);
      setSuccess("Alumno eliminado.");
      setResults((prev) =>
        prev.map((r) => (r.dni === selectedStudent.dni ? { ...r, student: null } : r))
      );
    } else {
      setError("No se pudo eliminar el alumno");
    }
  }

  const completedCount =
    selectedStudent?.progress.filter((p) => p.status === "completed").length ?? 0;
  const totalProgress = selectedStudent?.progress.length ?? 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-rule bg-paper-raised">
        <div className="flex items-start gap-4 border-b border-rule px-6 py-5 sm:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rule bg-accent-deep/80 text-ink">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">
              Habilitar nuevo DNI
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Solo los documentos habilitados pueden ingresar a la plataforma.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <form onSubmit={addDni} className="flex flex-wrap gap-3">
            <div className="relative min-w-[240px] flex-1">
              <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                required
                placeholder="Número de DNI"
                value={newDni}
                onChange={(e) => setNewDni(e.target.value)}
                className="w-full rounded-xl border border-rule bg-paper-raised py-3 pl-10 pr-4 text-sm text-ink-muted caret-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand-red/70 focus:ring-1 focus:ring-brand-red/30"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-brand-red-dark px-6 py-3 text-sm font-semibold text-white hover:bg-brand-red"
            >
              Habilitar DNI
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-rule bg-paper-muted px-5 py-3 text-sm font-semibold text-ink-muted hover:border-brand-red/40 hover:text-ink">
              <FileUp className="h-4 w-4" />
              {importingCsv ? "Importando..." : "Importar CSV"}
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                className="hidden"
                disabled={importingCsv}
                onChange={importCsv}
              />
            </label>
            <button
              type="button"
              onClick={exportProgress}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl border border-rule bg-paper-muted px-5 py-3 text-sm font-semibold text-ink-muted hover:bg-paper-muted hover:text-ink disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exportando..." : "Exportar progreso"}
            </button>
          </form>
          <p className="mt-3 text-xs text-ink-muted">
            CSV: una columna con DNIs (una fila por documento). Podés incluir encabezado “dni”.
          </p>
          {error && (
            <p className="mt-3 rounded-xl border border-brand-red/25 bg-brand-red/10 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              {success}
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-rule bg-paper-raised">
        <div className="flex items-start gap-4 border-b border-rule px-6 py-5 sm:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rule bg-paper-muted text-ink">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">
              Buscar y editar participantes
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Buscá por DNI, apellido o nombre. Podés editar, deshabilitar o eliminar desde aquí.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={searchDnis} className="flex flex-wrap gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                placeholder="DNI, apellido o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-rule bg-paper-raised py-3 pl-10 pr-4 text-sm text-ink-muted caret-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand-red/70 focus:ring-1 focus:ring-brand-red/30"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-red-dark px-5 py-3 text-sm font-semibold text-white hover:bg-brand-red disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {searching ? "Buscando..." : "Buscar"}
            </button>
            <button
              type="button"
              disabled={searching}
              onClick={() => searchDnis(undefined, { all: true })}
              className="rounded-xl border border-rule bg-paper-muted px-5 py-3 text-sm font-semibold text-ink-muted hover:bg-paper-muted hover:text-ink disabled:opacity-60"
            >
              Ver todos
            </button>
          </form>

          {!searched ? (
            <div className="mt-6 rounded-2xl border border-dashed border-rule bg-paper-muted px-5 py-10 text-center">
              <p className="text-sm font-medium text-ink-muted">Sin resultados aún</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
                La lista no se muestra hasta que busques o pulses “Ver todos”.
              </p>
            </div>
          ) : searching ? (
            <div className="mt-6 flex items-center justify-center gap-3 py-10 text-sm text-ink-muted">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
              Buscando resultados...
            </div>
          ) : results.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-rule bg-paper-muted px-5 py-8 text-center text-sm text-ink-muted">
              No se encontraron coincidencias con ese criterio.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {results.map((d) => {
                const name = fullName(d.student);
                return (
                  <li
                    key={d.id}
                    className="rounded-2xl border border-rule bg-paper-muted p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rule bg-accent-deep/30 text-red-200">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-ink">
                            {name ?? "Sin perfil cargado"}
                          </p>
                          {editingDniId === d.id ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <input
                                value={editDniValue}
                                onChange={(e) => setEditDniValue(e.target.value)}
                                className="rounded-lg border border-rule bg-paper-raised px-3 py-1.5 text-sm text-ink-muted caret-ink"
                              />
                              <button
                                type="button"
                                onClick={() => saveDniEdit(d.id)}
                                className="rounded-lg bg-brand-red-dark px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDniId(null)}
                                className="rounded-lg border border-rule px-3 py-1.5 text-xs font-semibold text-ink-muted"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                              <span className="inline-flex items-center gap-1 font-medium text-ink-muted">
                                <IdCard className="h-3.5 w-3.5 text-brand-red" />
                                DNI {d.dni}
                              </span>
                              {d.student?.company && (
                                <span className="inline-flex items-center gap-1">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {d.student.company}
                                </span>
                              )}
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ d.enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-paper-muted text-ink-muted" }`}
                              >
                                {d.enabled ? "Habilitado" : "Deshabilitado"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => viewStudent(d.dni)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-red-dark px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red"
                        >
                          <Eye className="h-4 w-4" />
                          Ver / editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDniId(d.id);
                            setEditDniValue(d.dni);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper-muted px-3.5 py-2.5 text-sm font-medium text-ink-muted hover:bg-paper-muted hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" />
                          DNI
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleDni(d.id, d.enabled)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper-muted px-3.5 py-2.5 text-sm font-medium text-ink-muted hover:bg-paper-muted hover:text-ink"
                        >
                          <Power className="h-4 w-4" />
                          {d.enabled ? "Deshabilitar" : "Habilitar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDni(d.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-red/30 px-3.5 py-2.5 text-sm font-medium text-red-300 hover:bg-brand-red/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {(loadingStudent || studentMessage || selectedStudent) && (
        <section className="overflow-hidden rounded-3xl border border-rule bg-paper-raised">
          <div className="border-b border-rule bg-paper-muted px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rule bg-paper-muted">
                  <UserRound className="h-6 w-6 text-ink" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">
                    Detalle del alumno
                  </h3>
                  <p className="text-sm text-ink-muted">Editar datos personales y progreso</p>
                </div>
              </div>
              {selectedStudent && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-paper-muted px-3.5 py-2 text-sm font-semibold text-ink-muted hover:bg-paper-muted"
                  >
                    <Pencil className="h-4 w-4" />
                    {editingProfile ? "Cerrar edición" : "Editar datos"}
                  </button>
                  <button
                    type="button"
                    onClick={deleteStudent}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-red/30 px-3.5 py-2 text-sm font-semibold text-red-300 hover:bg-brand-red/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar alumno
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {loadingStudent && (
              <div className="flex items-center justify-center gap-3 py-10 text-sm text-ink-muted">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
                Cargando detalle...
              </div>
            )}

            {!loadingStudent && studentMessage && (
              <p className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {studentMessage}
              </p>
            )}

            {!loadingStudent && selectedStudent && editingProfile && (
              <form onSubmit={saveProfile} className="mb-8 grid gap-4 rounded-2xl border border-rule bg-paper-muted p-5 sm:grid-cols-2">
                {[
                  ["dni", "DNI"],
                  ["firstName", "Nombre"],
                  ["lastName", "Apellido"],
                  ["email", "Email"],
                  ["phone", "Teléfono"],
                  ["company", "Empresa"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {label}
                    </label>
                    <input
                      value={profileForm[key as keyof typeof profileForm] as string}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, [key]: e.target.value })
                      }
                      className="w-full rounded-xl border border-rule bg-paper-raised px-3 py-2.5 text-sm text-ink-muted caret-ink outline-none placeholder:text-ink-muted focus:border-brand-red/70"
                    />
                  </div>
                ))}
                {[
                  ["sedeId", "Sector", directory.sedes],
                  ["puestoId", "Puesto", directory.puestos],
                  ["tareaId", "Tarea", directory.tareas],
                ].map(([key, label, options]) => (
                  <div key={key as string}>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {label as string}
                    </label>
                    <select
                      value={profileForm[key as keyof typeof profileForm] as string}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, [key as string]: e.target.value })
                      }
                      className="w-full rounded-xl border border-rule bg-paper-raised px-3 py-2.5 text-sm text-ink-muted caret-ink outline-none focus:border-brand-red/70"
                    >
                      <option value="">Sin asignar</option>
                      {(options as { id: string; name: string }[]).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <label className="flex items-center gap-2 text-sm text-ink-muted sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={profileForm.profileCompleted}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, profileCompleted: e.target.checked })
                    }
                  />
                  Perfil completo
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-xl bg-brand-red-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red disabled:opacity-60"
                  >
                    {savingProfile ? "Guardando..." : "Guardar cambios del alumno"}
                  </button>
                </div>
              </form>
            )}

            {!loadingStudent && selectedStudent && !editingProfile && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-rule bg-paper-muted p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Nombre</p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {fullName(selectedStudent) ?? "Perfil incompleto"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-rule bg-paper-muted p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">DNI</p>
                    <p className="mt-1 inline-flex items-center gap-2 font-semibold text-ink">
                      <IdCard className="h-4 w-4 text-brand-red" />
                      {selectedStudent.dni}
                    </p>
                  </div>
                  {selectedStudent.email && (
                    <div className="rounded-2xl border border-rule bg-paper-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Email</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-ink-muted">
                        <Mail className="h-4 w-4 text-ink-muted" />
                        {selectedStudent.email}
                      </p>
                    </div>
                  )}
                  {selectedStudent.phone && (
                    <div className="rounded-2xl border border-rule bg-paper-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Teléfono</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-ink-muted">
                        <Phone className="h-4 w-4 text-ink-muted" />
                        {selectedStudent.phone}
                      </p>
                    </div>
                  )}
                  {selectedStudent.company && (
                    <div className="rounded-2xl border border-rule bg-paper-muted p-4 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Empresa</p>
                      <p className="mt-1 inline-flex items-center gap-2 text-ink-muted">
                        <Building2 className="h-4 w-4 text-ink-muted" />
                        {selectedStudent.company}
                      </p>
                    </div>
                  )}
                  {selectedStudent.sede && (
                    <div className="rounded-2xl border border-rule bg-paper-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Sector</p>
                      <p className="mt-1 text-ink-muted">{selectedStudent.sede.name}</p>
                    </div>
                  )}
                  {selectedStudent.puesto && (
                    <div className="rounded-2xl border border-rule bg-paper-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Puesto</p>
                      <p className="mt-1 text-ink-muted">{selectedStudent.puesto.name}</p>
                    </div>
                  )}
                  {selectedStudent.tarea && (
                    <div className="rounded-2xl border border-rule bg-paper-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Tarea</p>
                      <p className="mt-1 text-ink-muted">{selectedStudent.tarea.name}</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h4 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
                        Progreso de capacitaciones
                      </h4>
                      <p className="text-sm text-ink-muted">Estado y resultados de cada curso</p>
                    </div>
                    {totalProgress > 0 && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                        <Award className="h-3.5 w-3.5" />
                        {completedCount} de {totalProgress} aprobadas
                      </div>
                    )}
                  </div>

                  {selectedStudent.progress.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-rule px-5 py-8 text-center text-sm text-ink-muted">
                      El alumno aún no inició ninguna capacitación.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedStudent.progress.map((p) => {
                        const config = statusConfig[p.status] ?? statusConfig.not_started;
                        const StatusIcon = config.icon;
                        const pct = progressPercent(p.status, p.score);
                        const theme = getRoomTheme(p.training.room.slug);
                        const RoomIcon = theme.icon;
                        return (
                          <div
                            key={p.id}
                            className="overflow-hidden border border-rule bg-paper-raised"
                          >
                            <div className="p-5">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-ink ${theme.accentBg}`}
                                  >
                                    <RoomIcon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className={`text-xs font-semibold uppercase tracking-wide ${theme.accent}`}>
                                      {p.training.room.name}
                                    </p>
                                    <p className="mt-0.5 font-semibold text-ink">{p.training.title}</p>
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.badge}`}
                                >
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {config.label}
                                  {p.score != null && ` · ${p.score}%`}
                                </span>
                              </div>

                              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                  className={`h-full rounded-full ${config.bar}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
