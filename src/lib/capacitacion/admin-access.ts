import { ADMIN_ROLE, type AdminRole } from "@/lib/capacitacion/constants";

export const TRAINER_HOME = "/capacitacion/admin";
export const PROGRESS_HOME = "/capacitacion/admin/progreso";
export const TRAINER_LOGIN = "/capacitacion/admin/login";
export const COMPANY_LOGIN = "/capacitacion/admin/progreso/login";

export type StaffPortal = "trainer" | "company";

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return value === ADMIN_ROLE.TRAINER || value === ADMIN_ROLE.COMPANY;
}

export function isCompanyRole(role: string | null | undefined): boolean {
  return role === ADMIN_ROLE.COMPANY;
}

export function isTrainerRole(role: string | null | undefined): boolean {
  return !isCompanyRole(role);
}

export function isAdminPublicPath(pathname: string): boolean {
  return pathname === TRAINER_LOGIN || pathname === COMPANY_LOGIN;
}

export function isProgressPagePath(pathname: string): boolean {
  return pathname === PROGRESS_HOME;
}

export function isCompanyAllowedApi(pathname: string): boolean {
  return pathname === "/api/admin/progress/export" || pathname.startsWith("/api/admin/progress/");
}

export function companyCanAccessPath(pathname: string, isApi: boolean): boolean {
  if (isAdminPublicPath(pathname)) return true;
  return isApi ? isCompanyAllowedApi(pathname) : isProgressPagePath(pathname);
}

export function staffHomePath(role: string | null | undefined): string {
  return isCompanyRole(role) ? PROGRESS_HOME : TRAINER_HOME;
}

export function staffLoginPath(pathname: string): string {
  return pathname === PROGRESS_HOME || pathname.startsWith(`${PROGRESS_HOME}/`)
    ? COMPANY_LOGIN
    : TRAINER_LOGIN;
}

export function sanitizeAdminNextPath(value: string | null, fallback: string): string {
  if (!value) return fallback;
  if (!value.startsWith("/capacitacion/admin")) return fallback;
  if (value.startsWith("//") || value.includes("://")) return fallback;
  const pathOnly = value.split("?")[0] ?? value;
  if (isAdminPublicPath(pathOnly)) return fallback;
  return value;
}

export function resolveStaffRedirect(
  role: string | null | undefined,
  requestedNext: string | null,
  portal: StaffPortal,
): string {
  if (isCompanyRole(role)) return PROGRESS_HOME;
  if (portal === "company") {
    return sanitizeAdminNextPath(requestedNext, PROGRESS_HOME);
  }
  return sanitizeAdminNextPath(requestedNext, TRAINER_HOME);
}
