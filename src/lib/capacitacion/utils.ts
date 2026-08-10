export function normalizeDni(dni: string): string {
  return dni.replace(/\D/g, "");
}

export function isValidDni(dni: string): boolean {
  const normalized = normalizeDni(dni);
  return normalized.length >= 7 && normalized.length <= 8;
}

export function formatDni(dni: string): string {
  return normalizeDni(dni);
}

/** Formato visual argentino: 34171099 → 34.171.099 */
export function formatDniDisplay(dni: string): string {
  const digits = normalizeDni(dni);
  if (!digits) return dni;
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, -3)}.${digits.slice(-3)}`;
  }
  return `${digits.slice(0, -6)}.${digits.slice(-6, -3)}.${digits.slice(-3)}`;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
