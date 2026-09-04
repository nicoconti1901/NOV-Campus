import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { isCompanyRole } from "@/lib/capacitacion/admin-access";

export type SessionData = {
  adminId?: string;
  adminRole?: string;
  studentId?: string;
  dni?: string;
};

const DEV_FALLBACK_SECRET = "casino-campus-dev-secret-cambiar-en-produccion";

/** Resolves session password. Production requires SESSION_SECRET (≥32 chars). */
export function getSessionPassword(): string {
  const secret = process.env.SESSION_SECRET?.trim() ?? "";

  if (process.env.NODE_ENV === "production") {
    if (secret.length >= 32) return secret;
    // next build sets NODE_ENV=production before runtime env may exist
    if (
      process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.npm_lifecycle_event === "build"
    ) {
      return "build-time-placeholder-secret-min-32-chars!!";
    }
    throw new Error(
      "SESSION_SECRET debe estar definida con al menos 32 caracteres en producción"
    );
  }

  return secret.length >= 32 ? secret : DEV_FALLBACK_SECRET;
}

export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: "casino_campus_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

/** @deprecated Prefer getSessionOptions() — kept for any external imports */
export const sessionOptions: SessionOptions = {
  get password() {
    return getSessionPassword();
  },
  cookieName: "casino_campus_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

/** For Edge middleware — pass the middleware response so cookie updates are preserved. */
export async function getSessionFromMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  return getIronSession<SessionData>(request, response, getSessionOptions());
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) {
    throw new Error("UNAUTHORIZED");
  }
  if (isCompanyRole(session.adminRole)) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireProgressAccess() {
  const session = await getSession();
  if (!session.adminId) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireStudent() {
  const session = await getSession();
  if (!session.studentId || !session.dni) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
