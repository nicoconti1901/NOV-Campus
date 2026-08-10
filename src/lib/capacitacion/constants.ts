export const ROOMS = [
  { slug: "medio-ambiente", name: "Medio Ambiente" },
  { slug: "salud-ocupacional", name: "Salud Ocupacional" },
  { slug: "seguridad-higiene", name: "Seguridad e Higiene" },
] as const;

export type RoomSlug = (typeof ROOMS)[number]["slug"];

export const PROGRESS_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const MATERIAL_TYPES = {
  VIDEO: "video",
  FILE: "file",
} as const;
