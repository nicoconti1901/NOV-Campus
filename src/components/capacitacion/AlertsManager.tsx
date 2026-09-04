"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bell, Info, Plus, ShieldAlert, Trash2, X } from "lucide-react";

type Severity = "info" | "warning" | "danger";

type Alert = {
  id: string;
  title: string;
  body: string;
  severity: Severity;
  active: boolean;
  publishedAt: string;
  expiresAt: string | null;
};

const SEVERITY_META: Record<Severity, { label: string; icon: React.ElementType; sheet: string }> = {
  info: {
    label: "Informativa",
    icon: Info,
    sheet: "bg-paper-raised text-ink",
  },
  warning: {
    label: "Advertencia",
    icon: AlertTriangle,
    sheet: "bg-stock-due text-stock-due-ink",
  },
  danger: {
    label: "Peligro",
    icon: ShieldAlert,
    sheet: "bg-stock-expired text-stock-expired-ink",
  },
};

const EMPTY_FORM = { title: "", body: "", severity: "info" as Severity, active: true, expiresAt: "" };

export function AlertsManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/alerts");
    if (res.ok) setAlerts(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(alert: Alert) {
    await fetch(`/api/admin/alerts/${alert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !alert.active }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta alerta?")) return;
    await fetch(`/api/admin/alerts/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      {/* Header + button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Sala de alertas
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold uppercase tracking-[0.06em] text-ink">
            Gestión de alertas
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Las alertas activas son visibles para todo el personal en el campus.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nueva alerta"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="overflow-hidden rounded-3xl border border-rule bg-paper-raised">
          <div className="border-b border-rule px-6 py-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-ink">
              Nueva alerta
            </h3>
          </div>
          <div className="space-y-4 p-6">
            {error && (
              <p className="rounded-xl border border-brand-red/30 bg-brand-red/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Título
              </label>
              <input
                className="w-full rounded-xl border border-rule bg-paper-raised px-4 py-2.5 text-sm text-ink-muted placeholder:text-ink-muted outline-none focus:border-brand-red/70 focus:ring-1 focus:ring-brand-red/30"
                placeholder="Ej: Curso de altura vencido"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Mensaje
              </label>
              <textarea
                rows={4}
                className="w-full resize-none rounded-xl border border-rule bg-paper-raised px-4 py-2.5 text-sm text-ink-muted placeholder:text-ink-muted outline-none focus:border-brand-red/70 focus:ring-1 focus:ring-brand-red/30"
                placeholder="Describí la alerta con el detalle necesario para el personal..."
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  Tipo
                </label>
                <select
                  className="w-full rounded-xl border border-rule bg-paper-raised px-4 py-2.5 text-sm text-ink-muted outline-none focus:border-brand-red/70 focus:ring-1 focus:ring-brand-red/30"
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as Severity }))}
                >
                  <option value="info">Informativa</option>
                  <option value="warning">Advertencia</option>
                  <option value="danger">Peligro</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  Estado inicial
                </label>
                <select
                  className="w-full rounded-xl border border-rule bg-paper-raised px-4 py-2.5 text-sm text-ink-muted outline-none focus:border-brand-red/70 focus:ring-1 focus:ring-brand-red/30"
                  value={form.active ? "1" : "0"}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "1" }))}
                >
                  <option value="1">Activa</option>
                  <option value="0">Inactiva</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  Vence (opcional)
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-rule bg-paper-raised px-4 py-2.5 text-sm text-ink-muted outline-none focus:border-brand-red/70 focus:ring-1 focus:ring-brand-red/30"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={save}
                disabled={saving || !form.title || !form.body}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Publicar alerta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-ink-muted">Cargando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-rule py-16 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-ink-muted" />
          <p className="text-sm text-ink-muted">No hay alertas creadas todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const meta = SEVERITY_META[alert.severity as Severity] ?? SEVERITY_META.info;
            const SeverityIcon = meta.icon;
            const expired = alert.expiresAt && new Date(alert.expiresAt) < new Date();
            return (
              <div
                key={alert.id}
                className={`border border-rule ${meta.sheet} transition-opacity ${!alert.active || expired ? "opacity-50" : ""}`}
              >
                                <div className="flex items-start gap-4 px-6 py-4">
                  <SeverityIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{alert.title}</p>
                      <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em]">
                        {meta.label}
                      </span>
                      {!alert.active && (
                        <span className="rounded-full border border-rule px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                          Inactiva
                        </span>
                      )}
                      {expired && (
                        <span className="rounded-full border border-rule px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                          Vencida
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">{alert.body}</p>
                    <p className="mt-1 text-[10px] text-ink-muted">
                      Publicada {new Date(alert.publishedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
                      {alert.expiresAt && ` · Vence ${new Date(alert.expiresAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => toggleActive(alert)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${ alert.active ? "border-rule text-ink-muted hover:border-rule hover:text-ink" : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" }`}
                    >
                      {alert.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => remove(alert.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-rule text-ink-muted transition-colors hover:border-brand-red hover:text-brand-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
