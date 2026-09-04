"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, Clock3, ShieldAlert, ClipboardList } from "lucide-react";
import { CertificateDownloadButton } from "@/components/capacitacion/CertificateDownloadButton";
import type { AssignmentBucket } from "@/lib/capacitacion/matrix-engine";

export type CampusBoardItem = {
  id: string;
  trainingId: string;
  title: string;
  roomName: string;
  bucket: AssignmentBucket;
  dueLabel: string;
  progressStatus: string | null;
  score: number | null;
};

type TabId = AssignmentBucket;

const TABS: Array<{
  id: TabId;
  label: string;
  hint: string;
  stamp: string;
  icon: typeof ShieldAlert;
  card: string;
  glow: string;
  bar: string;
  badge: string;
  number: string;
  panel: string;
  fill: string;
  iconBox: string;
  selected: string;
  cardBorder: string;
}> = [
  {
    id: "expired",
    label: "Vencidas",
    hint: "El certificado ya no vale. Hay que recursar.",
    stamp: "Vencida",
    icon: ShieldAlert,
    card: "ring-red-200/80 hover:ring-red-300",
    cardBorder: "border-red-200 hover:border-red-300",
    glow: "bg-red-500/20",
    bar: "from-red-500 to-rose-600",
    badge: "bg-red-600 text-white",
    number: "text-red-700",
    panel: "ring-red-200/80 bg-red-50/90",
    fill: "bg-red-50",
    iconBox: "bg-red-600 text-white",
    selected: "bg-red-100 ring-red-300 shadow-[0_20px_44px_-24px_rgba(185,28,28,0.6)]",
  },
  {
    id: "due_soon",
    label: "Por vencer",
    hint: "Completalas antes de la fecha de vencimiento.",
    stamp: "Por vencer",
    icon: Clock3,
    card: "ring-amber-200/80 hover:ring-amber-300",
    cardBorder: "border-amber-200 hover:border-amber-300",
    glow: "bg-amber-400/25",
    bar: "from-amber-400 to-orange-500",
    badge: "bg-amber-500 text-white",
    number: "text-amber-800",
    panel: "ring-amber-200/80 bg-amber-50/90",
    fill: "bg-amber-50",
    iconBox: "bg-amber-500 text-white",
    selected: "bg-amber-100 ring-amber-300 shadow-[0_20px_44px_-24px_rgba(217,119,6,0.55)]",
  },
  {
    id: "pending",
    label: "Asignadas",
    hint: "Obligatorias de tu celda, todavia dentro de vigencia.",
    stamp: "Asignada",
    icon: ClipboardList,
    card: "ring-sky-200/80 hover:ring-sky-300",
    cardBorder: "border-sky-200 hover:border-sky-300",
    glow: "bg-sky-400/20",
    bar: "from-sky-500 to-blue-600",
    badge: "bg-sky-600 text-white",
    number: "text-sky-800",
    panel: "ring-sky-200/80 bg-sky-50/90",
    fill: "bg-sky-50",
    iconBox: "bg-sky-600 text-white",
    selected: "bg-sky-100 ring-sky-300 shadow-[0_20px_44px_-24px_rgba(2,132,199,0.55)]",
  },
  {
    id: "completed",
    label: "Vigentes",
    hint: "Aprobadas. El certificado sigue valido.",
    stamp: "Vigente",
    icon: CheckCircle2,
    card: "ring-emerald-200/80 hover:ring-emerald-300",
    cardBorder: "border-emerald-200 hover:border-emerald-300",
    glow: "bg-emerald-400/20",
    bar: "from-emerald-400 to-teal-500",
    badge: "bg-emerald-600 text-white",
    number: "text-emerald-800",
    panel: "ring-emerald-200/80 bg-emerald-50/90",
    fill: "bg-emerald-50",
    iconBox: "bg-emerald-600 text-white",
    selected: "bg-emerald-100 ring-emerald-300 shadow-[0_20px_44px_-24px_rgba(5,150,105,0.55)]",
  },
];

const STATUS_LABEL: Record<string, string> = {
  not_started: "Sin iniciar",
  in_progress: "En curso",
  completed: "Aprobada",
  failed: "No aprobada",
  expired: "Vencida",
};

function pickInitialTab(counts: Record<TabId, number>): TabId {
  if (counts.expired > 0) return "expired";
  if (counts.due_soon > 0) return "due_soon";
  if (counts.pending > 0) return "pending";
  return "completed";
}

export function CampusAssignmentBoard({ items }: { items: CampusBoardItem[] }) {
  const counts = {
    expired: items.filter((item) => item.bucket === "expired").length,
    due_soon: items.filter((item) => item.bucket === "due_soon").length,
    pending: items.filter((item) => item.bucket === "pending").length,
    completed: items.filter((item) => item.bucket === "completed").length,
  };
  const [tab, setTab] = useState<TabId>(() => pickInitialTab(counts));
  const [room, setRoom] = useState("todas");

  const tabMeta = TABS.find((item) => item.id === tab) ?? TABS[0];
  const inTab = useMemo(() => items.filter((item) => item.bucket === tab), [items, tab]);
  const rooms = useMemo(
    () => [...new Set(inTab.map((item) => item.roomName))].sort((a, b) => a.localeCompare(b, "es")),
    [inTab]
  );
  const visible = room === "todas" ? inTab : inTab.filter((item) => item.roomName === room);

  return (
    <section className="space-y-4">
      <div role="tablist" aria-label="Estado de tus capacitaciones" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TABS.map((item, index) => {
          const selected = item.id === tab;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setTab(item.id);
                setRoom("todas");
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl p-4 text-left ring-1 backdrop-blur-sm transition-shadow ${item.fill} ${item.card} ${
                selected ? item.selected : "shadow-sm"
              }`}
            >
              <span className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${item.bar}`} />
              {selected ? (
                <motion.span
                  layoutId="status-glow"
                  className={`pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full blur-2xl ${item.glow}`}
                />
              ) : null}
              <span className="relative flex items-start justify-between gap-3">
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.iconBox}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </span>
                  <motion.span
                    key={counts[item.id]}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 block font-display text-4xl font-semibold ${item.number}`}
                  >
                    {counts[item.id]}
                  </motion.span>
                  <span className="mt-1.5 block max-w-[16rem] text-[11px] leading-snug text-ink-muted">
                    {item.hint}
                  </span>
                </span>
                {selected ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${item.badge}`}>
                    Activo
                  </span>
                ) : null}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={`overflow-hidden rounded-3xl ring-1 backdrop-blur-xl ${tabMeta.panel}`}
        >
          <div className="flex flex-col gap-3 border-b border-slate-200/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">{tabMeta.hint}</p>
            {rooms.length > 1 && (
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                Sala
                <select
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  className="rounded-xl border border-rule bg-white px-2.5 py-1.5 text-sm text-ink outline-none"
                >
                  <option value="todas">Todas</option>
                  {rooms.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-ink-muted">No hay capacitaciones en esta lista.</p>
          ) : (
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item, index) => (
                <AssignmentCard
                  key={item.id}
                  item={item}
                  stamp={tabMeta.stamp}
                  badge={tabMeta.badge}
                  bar={tabMeta.bar}
                  cardBorder={tabMeta.cardBorder}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

function AssignmentCard({
  item,
  stamp,
  badge,
  bar,
  cardBorder,
  index,
}: {
  item: CampusBoardItem;
  stamp: string;
  badge: string;
  bar: string;
  cardBorder: string;
  index: number;
}) {
  const href = `/capacitacion/campus/capacitacion/${item.trainingId}`;
  const statusLabel =
    item.bucket === "expired"
      ? "Vencida"
      : item.bucket === "completed"
        ? "Vigente"
        : STATUS_LABEL[item.progressStatus ?? "not_started"] ?? "Sin iniciar";
  const actionLabel = item.bucket === "expired" ? "Recursar" : item.bucket === "completed" ? "Ver" : "Cursar";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.28 }}
      className={`group relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm ${cardBorder}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 bg-linear-to-b ${bar}`} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <p className="font-medium leading-snug text-ink">{item.title}</p>
          <p className="mt-1.5 text-xs text-ink-muted">{item.roomName}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${badge}`}>
          {stamp}
          {item.bucket === "completed" && item.score != null ? ` ${item.score}%` : ""}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3 pl-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Vence</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">{item.dueLabel}</p>
          {item.bucket !== "completed" ? (
            <p className="mt-0.5 text-xs text-ink-muted">{statusLabel}</p>
          ) : null}
        </div>
        {item.bucket === "completed" ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href={href}
              className="inline-flex items-center rounded-xl border border-rule bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper-muted"
            >
              Ver
            </Link>
            <CertificateDownloadButton
              trainingId={item.trainingId}
              trainingTitle={item.title}
              label="PDF"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            />
          </div>
        ) : (
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy/90"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </motion.article>
  );
}
