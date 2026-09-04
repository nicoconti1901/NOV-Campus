export const ROOMS = [
  { slug: "medio-ambiente", name: "Medio Ambiente" },
  { slug: "salud-ocupacional", name: "Salud Ocupacional" },
  { slug: "seguridad-higiene", name: "Seguridad e Higiene" },
  { slug: "seguridad-vial", name: "Seguridad Vial" },
  { slug: "emergencias-respuestas", name: "Emergencias y Respuestas" },
  { slug: "gestion-hse", name: "Gestión HSE" },
  { slug: "competencias-tecnicas", name: "Competencias Técnicas del Puesto" },
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

export const ASSIGNMENT_STATUS = {
  ASSIGNED: "assigned",
  COMPLETED: "completed",
  EXPIRED: "expired",
} as const;

export const MATRIX_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export const NOTICE_WINDOWS_DAYS = [30, 7, 1] as const;

export const ADMIN_ROLE = {
  TRAINER: "trainer",
  COMPANY: "company",
} as const;

export type AdminRole = (typeof ADMIN_ROLE)[keyof typeof ADMIN_ROLE];
