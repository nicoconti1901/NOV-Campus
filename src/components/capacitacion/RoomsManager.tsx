"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getRoomTheme } from "@/lib/capacitacion/rooms";
import {
  formFieldClass,
  formLabelClass,
  formPanelClass,
  formSecondaryBtnClass,
} from "@/lib/capacitacion/form-styles";

type Room = {
  id: string;
  name: string;
  slug: string;
  _count: { trainings: number };
};

export function RoomsManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/rooms");
    if (res.ok) setRooms(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(room: Room) {
    setEditingId(room.id);
    setName(room.name);
    setSlug(room.slug);
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const url = editingId ? `/api/admin/rooms/${editingId}` : "/api/admin/rooms";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined }),
    });

    if (res.ok) {
      setSuccess(editingId ? "Sala actualizada." : "Sala creada.");
      resetForm();
      await load();
    } else {
      const data = await res.json();
      setError(data.error ?? "No se pudo guardar la sala");
    }
    setSaving(false);
  }

  async function removeRoom(room: Room) {
    const message =
      room._count.trainings > 0
        ? `¿Eliminar la sala "${room.name}" y sus ${room._count.trainings} capacitaciones? Esta acción no se puede deshacer.`
        : `¿Eliminar la sala "${room.name}"?`;
    if (!confirm(message)) return;

    const res = await fetch(`/api/admin/rooms/${room.id}`, { method: "DELETE" });
    if (res.ok) {
      setSuccess("Sala eliminada.");
      if (editingId === room.id) resetForm();
      await load();
    } else {
      const data = await res.json();
      setError(data.error ?? "No se pudo eliminar");
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-muted">Cargando salas...</p>;
  }

  return (
    <div className="space-y-6">
      <section className={formPanelClass}>
        <div className="mb-5 border-b border-rule pb-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">
            {editingId ? "Editar sala" : "Nueva sala"}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            Creá o modificá las áreas temáticas del campus.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={formLabelClass}>Nombre</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Medio Ambiente"
                className={formFieldClass}
              />
            </div>
            <div>
              <label className={formLabelClass}>
                Identificador (slug)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Se genera solo si lo dejás vacío"
                className={formFieldClass}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear sala"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className={formSecondaryBtnClass}
              >
                Cancelar
              </button>
            )}
          </div>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}
        </form>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-rule bg-paper-raised px-4 py-3.5 sm:px-5">
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.1em] text-ink">Salas existentes</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const theme = getRoomTheme(room.slug);
            const Icon = theme.icon;
            return (
              <div
                key={room.id}
                className={`overflow-hidden rounded-3xl border border-rule bg-paper-raised ${theme.ring}`}
              >
                <div className="relative h-36">
                  <Image
                    src={theme.coverImage}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlay}`} />
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur">
                      <Icon className="h-5 w-5 text-ink" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-ink">{room.name}</h4>
                      <p className="text-xs text-ink-muted">
                        {room.slug} · {room._count.trainings} curso
                        {room._count.trainings !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-rule p-4">
                  <button
                    type="button"
                    onClick={() => startEdit(room)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-red px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoom(room)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-brand-red/35 px-3 py-2.5 text-sm font-semibold text-brand-red hover:bg-brand-red/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Borrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
