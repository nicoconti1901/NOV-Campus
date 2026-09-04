import { Car, HardHat, HeartPulse, Leaf, ShieldAlert, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import type { RoomSlug } from "./constants";

export type RoomTheme = {
  icon: LucideIcon;
  coverImage: string;
  gradient: string;
  overlay: string;
  accent: string;
  coverAccent: string;
  accentBg: string;
  accentBorder: string;
  ring: string;
  subtitle: string;
};

const roomThemes: Partial<Record<RoomSlug, RoomTheme>> = {
  "medio-ambiente": {
    icon: Leaf,
    coverImage: "/images/medioambiente.webp",
    gradient: "from-emerald-700 to-teal-900",
    overlay: "from-emerald-950/90 via-emerald-900/70 to-emerald-950/95",
    accent: "text-emerald-700",
    coverAccent: "text-emerald-200",
    accentBg: "bg-emerald-600",
    accentBorder: "border-emerald-600",
    ring: "ring-emerald-500/20 hover:ring-emerald-500/40",
    subtitle: "Gestión ambiental y cumplimiento normativo",
  },
  "salud-ocupacional": {
    icon: HeartPulse,
    coverImage: "/images/salud.jpg",
    gradient: "from-sky-700 to-blue-900",
    overlay: "from-sky-950/90 via-sky-900/70 to-blue-950/95",
    accent: "text-sky-700",
    coverAccent: "text-sky-200",
    accentBg: "bg-sky-600",
    accentBorder: "border-sky-600",
    ring: "ring-sky-500/20 hover:ring-sky-500/40",
    subtitle: "Bienestar y prevención en el trabajo",
  },
  "seguridad-higiene": {
    icon: HardHat,
    coverImage: "/images/fondo.webp",
    gradient: "from-accent-deep to-accent-deeper",
    overlay: "from-accent-deeper/95 via-accent-deep/75 to-brand-dark/95",
    accent: "text-brand-red",
    coverAccent: "text-red-200",
    accentBg: "bg-brand-red-dark",
    accentBorder: "border-brand-red-dark",
    ring: "ring-brand-red/15 hover:ring-brand-red/30",
    subtitle: "Prevención de riesgos laborales",
  },
  "seguridad-vial": {
    icon: Car,
    coverImage: "/images/VIAL.jpg",
    gradient: "from-amber-700 to-orange-900",
    overlay: "from-amber-950/90 via-amber-900/65 to-orange-950/95",
    accent: "text-amber-700",
    coverAccent: "text-amber-200",
    accentBg: "bg-amber-600",
    accentBorder: "border-amber-500",
    ring: "ring-amber-500/20 hover:ring-amber-500/40",
    subtitle: "Conducción segura y gestión de viajes",
  },
  "emergencias-respuestas": {
    icon: ShieldAlert,
    coverImage: "/images/emergencia.png",
    gradient: "from-rose-700 to-red-900",
    overlay: "from-rose-950/90 via-rose-900/65 to-red-950/95",
    accent: "text-rose-700",
    coverAccent: "text-rose-200",
    accentBg: "bg-rose-600",
    accentBorder: "border-rose-500",
    ring: "ring-rose-500/20 hover:ring-rose-500/40",
    subtitle: "Planes de emergencia, primeros auxilios y simulacros",
  },
  "gestion-hse": {
    icon: ShieldCheck,
    coverImage: "/images/gestion.webp",
    gradient: "from-cyan-700 to-teal-900",
    overlay: "from-cyan-950/90 via-teal-900/65 to-teal-950/95",
    accent: "text-cyan-700",
    coverAccent: "text-cyan-200",
    accentBg: "bg-cyan-600",
    accentBorder: "border-cyan-500",
    ring: "ring-cyan-500/20 hover:ring-cyan-500/40",
    subtitle: "Sistema de gestión ISO 45001 / 14001 / 9001",
  },
  "competencias-tecnicas": {
    icon: Wrench,
    coverImage: "/images/compe.jpeg",
    gradient: "from-slate-700 to-zinc-900",
    overlay: "from-slate-950/90 via-zinc-900/65 to-slate-950/95",
    accent: "text-slate-700",
    coverAccent: "text-slate-200",
    accentBg: "bg-slate-600",
    accentBorder: "border-slate-400",
    ring: "ring-slate-500/20 hover:ring-slate-500/40",
    subtitle: "Habilitaciones, END y tareas específicas del puesto",
  },
};

const defaultTheme: RoomTheme = {
  icon: HardHat,
  coverImage: "/images/sala.jpg",
  gradient: "from-brand-gray to-brand-dark",
  overlay: "from-brand-dark/90 via-brand-gray/70 to-brand-dark/95",
  accent: "text-brand-gray",
  coverAccent: "text-white",
  accentBg: "bg-brand-gray",
  accentBorder: "border-brand-gray",
  ring: "ring-gray-200 hover:ring-gray-300",
  subtitle: "Capacitaciones especializadas",
};

export function getRoomTheme(slug: string): RoomTheme {
  return roomThemes[slug as RoomSlug] ?? defaultTheme;
}

