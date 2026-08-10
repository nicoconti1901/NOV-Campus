import path from "path";
import {
  CHUNK_SIZE,
  MAX_BYTES,
  MAX_CHUNK_BYTES,
  MAX_LABEL,
} from "@/lib/capacitacion/upload-limits";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads", "capacitaciones");
export const UPLOAD_TMP_DIR = path.join(UPLOAD_DIR, ".tmp");
export { CHUNK_SIZE, MAX_BYTES, MAX_CHUNK_BYTES, MAX_LABEL };

export const ALLOWED_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const ALLOWED_EXT = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
]);

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function isValidUploadId(id: string) {
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id);
}

/** Extensión manda; MIME vacío/octet-stream/video genérico se aceptan si la ext es válida. */
export function isAllowedMimeForExt(mime: string, ext: string): boolean {
  if (!ALLOWED_EXT.has(ext)) return false;
  const m = mime.trim().toLowerCase();
  if (!m) return true;
  if (m === "application/octet-stream") return true;
  if (ALLOWED_MIME.has(m)) return true;
  // Algunos navegadores reportan variantes (p. ej. video/x-m4v, video/mpeg)
  if (ext === ".mp4" || ext === ".mov" || ext === ".webm") {
    return m.startsWith("video/");
  }
  return false;
}
