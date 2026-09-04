import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { formatDni } from "@/lib/capacitacion/utils";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const dni = request.nextUrl.searchParams.get("dni")?.trim() ?? "";

  if (!q && !dni) {
    return NextResponse.json([]);
  }

  const normalizedDni = dni ? formatDni(dni) : "";

  const students = await prisma.student.findMany({
    where: normalizedDni
      ? { dni: normalizedDni }
      : {
          OR: [
            { dni: { contains: formatDni(q) || q } },
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
            { company: { contains: q } },
          ],
        },
    include: {
      progress: {
        include: {
          training: { include: { room: { select: { name: true, slug: true } } } },
        },
        orderBy: { updatedAt: "desc" },
      },
      attempts: {
        orderBy: { attemptedAt: "desc" },
        take: 10,
        include: { training: true },
      },
      sede: true,
      puesto: true,
      tarea: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return NextResponse.json(students);
}
