import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { formatDni, isValidDni } from "@/lib/capacitacion/utils";

async function enrichDnis(
  dnis: { id: string; dni: string; enabled: boolean; createdAt: Date }[]
) {
  if (dnis.length === 0) return [];

  const students = await prisma.student.findMany({
    where: { dni: { in: dnis.map((d) => d.dni) } },
    select: {
      dni: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
      profileCompleted: true,
    },
  });

  const byDni = new Map(students.map((s) => [s.dni, s]));

  return dnis.map((d) => ({
    ...d,
    student: byDni.get(d.dni) ?? null,
  }));
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const all = request.nextUrl.searchParams.get("all") === "1";

  if (!q && !all) {
    return NextResponse.json([]);
  }

  if (all) {
    const dnis = await prisma.allowedDni.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(await enrichDnis(dnis));
  }

  const normalized = formatDni(q);
  const hasDigits = normalized.length > 0;
  const looksLikeName = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(q);

  const matchingStudents = looksLikeName
    ? await prisma.student.findMany({
        where: {
          OR: [
            { lastName: { contains: q } },
            { firstName: { contains: q } },
            { email: { contains: q } },
            { company: { contains: q } },
          ],
        },
        select: { dni: true },
        take: 50,
      })
    : [];

  const studentDnis = matchingStudents.map((s) => s.dni);

  const orFilters = [
    ...(hasDigits
      ? [{ dni: { contains: normalized } }, { dni: { contains: q } }]
      : []),
    ...(studentDnis.length > 0 ? [{ dni: { in: studentDnis } }] : []),
  ];

  if (orFilters.length === 0) {
    return NextResponse.json([]);
  }

  const dnis = await prisma.allowedDni.findMany({
    where: { OR: orFilters },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(await enrichDnis(dnis));
}

const schema = z.object({ dni: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  try {
    const { dni } = schema.parse(await request.json());
    const normalized = formatDni(dni);
    if (!isValidDni(normalized)) return apiError("DNI inválido");

    const created = await prisma.allowedDni.upsert({
      where: { dni: normalized },
      update: { enabled: true },
      create: { dni: normalized },
    });

    const [enriched] = await enrichDnis([created]);
    return NextResponse.json(enriched, { status: 201 });
  } catch {
    return apiError("No se pudo agregar el DNI");
  }
}
