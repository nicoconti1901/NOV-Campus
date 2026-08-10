import { NextRequest, NextResponse } from "next/server";
import { getSessionFromMiddleware } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Public auth endpoints and admin login page
  if (
    pathname.startsWith("/api/auth/") ||
    pathname === "/capacitacion/admin/login"
  ) {
    return response;
  }

  let session;
  try {
    session = await getSessionFromMiddleware(request, response);
  } catch {
    // Missing/invalid SESSION_SECRET in production
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Configuración de sesión inválida" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/capacitacion", request.url));
  }

  // /api/upload se autentica en la route (no en middleware) para no bufferizar videos grandes
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isCampusApi =
    pathname.startsWith("/api/campus/") || pathname.startsWith("/api/files/");
  const isAdminPage =
    pathname.startsWith("/capacitacion/admin") &&
    pathname !== "/capacitacion/admin/login";
  const isCampusPage = pathname.startsWith("/capacitacion/campus");

  if (isAdminApi || isAdminPage) {
    if (!session.adminId) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      const login = new URL("/capacitacion/admin/login", request.url);
      return NextResponse.redirect(login);
    }
    return response;
  }

  if (isCampusApi || isCampusPage) {
    if (!session.studentId || !session.dni) {
      // Files may also be opened by admins previewing content
      if (pathname.startsWith("/api/files/") && session.adminId) {
        return response;
      }
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      try {
        const key = process.env.CAMPUS_ACCESS_KEY;
        const loginPath = key ? `/capacitacion/${key}` : "/capacitacion";
        return NextResponse.redirect(new URL(loginPath, request.url));
      } catch {
        return NextResponse.redirect(new URL("/capacitacion", request.url));
      }
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/capacitacion/admin/:path*",
    "/capacitacion/campus/:path*",
    "/api/admin/:path*",
    "/api/campus/:path*",
    "/api/files/:path*",
  ],
};
