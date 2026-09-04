"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formFieldClass, formHintClass, formLabelClass, formPanelClass } from "@/lib/capacitacion/form-styles";

type Master = { id: string; name: string };

export function PerfilForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    sedeId: "",
    puestoId: "",
    tareaId: "",
  });
  const [directory, setDirectory] = useState<{ sedes: Master[]; puestos: Master[]; tareas: Master[] }>({
    sedes: [],
    puestos: [],
    tareas: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/campus/profile");
      if (!res.ok) {
        setBooting(false);
        return;
      }
      const data = await res.json();
      const student = data.student ?? {};
      setDirectory(data.directory ?? { sedes: [], puestos: [], tareas: [] });
      setForm({
        firstName: student.firstName ?? "",
        lastName: student.lastName ?? "",
        email: student.email ?? "",
        phone: student.phone ?? "",
        company: student.company ?? "",
        sedeId: student.sedeId ?? "",
        puestoId: student.puestoId ?? "",
        tareaId: student.tareaId ?? "",
      });
      setBooting(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/campus/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await router.push("/capacitacion/campus");
        return;
      }
      const data = await res.json();
      setError(data.error ?? "Error al guardar perfil");
    } catch {
      setError("Error al guardar perfil");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return (
      <div className={`mx-auto max-w-lg ${formPanelClass}`}>
        <p className="text-sm text-ink-muted">Cargando datos del perfil...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-lg ${formPanelClass}`}>
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.06em] text-ink">
        Completá tu perfil
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        El campus no ofrece un catálogo abierto. Las capacitaciones se derivan de tu sector, puesto y tarea.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={formLabelClass}>Nombre</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className={formFieldClass}
            />
          </div>
          <div>
            <label className={formLabelClass}>Apellido</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className={formFieldClass}
            />
          </div>
        </div>
        <div>
          <label className={formLabelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={formFieldClass}
          />
        </div>
        <div>
          <label className={formLabelClass}>Teléfono</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={formFieldClass}
          />
        </div>
        <div>
          <label className={formLabelClass}>Empresa</label>
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className={formFieldClass}
          />
        </div>

        <div className="border-t border-rule pt-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-ink">
            Sector, puesto y tarea
          </h3>
          <p className={`mt-1 mb-4 ${formHintClass}`}>
            Sector, puesto y tarea determinan qué cursos te tocan. No se eligen del catálogo.
          </p>
          <div className="space-y-4">
            <div>
              <label className={formLabelClass}>Sector</label>
              <select
                required
                value={form.sedeId}
                onChange={(e) => setForm({ ...form, sedeId: e.target.value })}
                className={formFieldClass}
              >
                <option value="">Seleccioná sector</option>
                {directory.sedes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={formLabelClass}>Puesto</label>
              <select
                required
                value={form.puestoId}
                onChange={(e) => setForm({ ...form, puestoId: e.target.value })}
                className={formFieldClass}
              >
                <option value="">Seleccioná puesto</option>
                {directory.puestos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={formLabelClass}>Tarea</label>
              <select
                required
                value={form.tareaId}
                onChange={(e) => setForm({ ...form, tareaId: e.target.value })}
                className={formFieldClass}
              >
                <option value="">Seleccioná tarea</option>
                {directory.tareas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-red py-3 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Ver mis capacitaciones"}
        </button>
      </form>
    </div>
  );
}
