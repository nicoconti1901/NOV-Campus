import { HardHat, HeartPulse, Leaf, type LucideIcon } from "lucide-react";
import type { RoomSlug } from "./constants";

export type RoomTheme = {
  icon: LucideIcon;
  coverImage: string;
  gradient: string;
  overlay: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  ring: string;
  subtitle: string;
};

const roomThemes: Record<RoomSlug, RoomTheme> = {
  "medio-ambiente": {
    icon: Leaf,
    coverImage: "/images/medioambiente.webp",
    gradient: "from-emerald-700 to-teal-900",
    overlay: "from-emerald-950/90 via-emerald-900/70 to-emerald-950/95",
    accent: "text-emerald-700",
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
    accentBg: "bg-sky-600",
    accentBorder: "border-sky-600",
    ring: "ring-sky-500/20 hover:ring-sky-500/40",
    subtitle: "Bienestar y prevención en el trabajo",
  },
  "seguridad-higiene": {
    icon: HardHat,
    coverImage: "/images/seguridad.jpg",
    gradient: "from-brand-red to-brand-red-dark",
    overlay: "from-brand-red/95 via-brand-red-dark/75 to-brand-dark/95",
    accent: "text-brand-red",
    accentBg: "bg-brand-red",
    accentBorder: "border-brand-red",
    ring: "ring-brand-red/20 hover:ring-brand-red/40",
    subtitle: "Prevención de riesgos laborales",
  },
};

const defaultTheme: RoomTheme = {
  icon: HardHat,
  coverImage: "/images/sala.jpg",
  gradient: "from-brand-gray to-brand-dark",
  overlay: "from-brand-dark/90 via-brand-gray/70 to-brand-dark/95",
  accent: "text-brand-gray",
  accentBg: "bg-brand-gray",
  accentBorder: "border-brand-gray",
  ring: "ring-gray-200 hover:ring-gray-300",
  subtitle: "Capacitaciones especializadas",
};

export function getRoomTheme(slug: string): RoomTheme {
  return roomThemes[slug as RoomSlug] ?? defaultTheme;
}

