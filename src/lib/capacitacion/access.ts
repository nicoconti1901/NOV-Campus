import { timingSafeEqual } from "crypto";

export function getCampusAccessKey(): string {
  const key = process.env.CAMPUS_ACCESS_KEY;
  if (!key) {
    throw new Error("CAMPUS_ACCESS_KEY no está configurada en las variables de entorno");
  }
  return key;
}

export function getCampusLoginPath(): string {
  return `/capacitacion/${getCampusAccessKey()}`;
}

export function isValidCampusAccessKey(key: string): boolean {
  const expected = process.env.CAMPUS_ACCESS_KEY;
  if (!expected || key.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(key), Buffer.from(expected));
  } catch {
    return false;
  }
}
