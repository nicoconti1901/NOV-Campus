import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProgressAccess } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { formatDniDisplay } from "@/lib/capacitacion/utils";

function csvEscape(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    await requireProgressAccess();
  } catch {
    return unauthorized();
  }

  const rows = await prisma.trainingProgress.findMany({
    include: {
      student: {
        select: {
          dni: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
        },
      },
      training: {
        select: {
          title: true,
          room: { select: { name: true } },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  const header = [
    "dni",
    "apellido",
    "nombre",
    "email",
    "empresa",
    "sala",
    "capacitacion",
    "estado",
    "puntaje",
    "fecha_completado",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        formatDniDisplay(r.student.dni),
        csvEscape(r.student.lastName),
        csvEscape(r.student.firstName),
        csvEscape(r.student.email),
        csvEscape(r.student.company),
        csvEscape(r.training.room.name),
        csvEscape(r.training.title),
        csvEscape(r.status),
        r.score ?? "",
        r.completedAt ? r.completedAt.toISOString() : "",
      ].join(",")
    ),
  ];

  const csv = "\uFEFF" + lines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="progreso-alumnos.csv"`,
    },
  });
}
