import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { apiError } from "@/lib/api";
import { formatDni, isValidDni } from "@/lib/capacitacion/utils";
import { isValidCampusAccessKey } from "@/lib/capacitacion/access";

const schema = z.object({
  dni: z.string().min(1),
  accessKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { dni, accessKey } = schema.parse(await request.json());

    if (!isValidCampusAccessKey(accessKey)) {
      return apiError("Enlace de acceso inválido", 403);
    }

    const normalized = formatDni(dni);

    if (!isValidDni(normalized)) {
      return apiError("DNI inválido");
    }

    const allowed = await prisma.allowedDni.findUnique({ where: { dni: normalized } });
    if (!allowed || !allowed.enabled) {
      return apiError("DNI no habilitado para acceder al campus", 403);
    }

    let student = await prisma.student.findUnique({ where: { dni: normalized } });
    if (!student) {
      student = await prisma.student.create({ data: { dni: normalized } });
    }

    const session = await getSession();
    session.studentId = student.id;
    session.dni = normalized;
    session.adminId = undefined;
    await session.save();

    return NextResponse.json({
      ok: true,
      profileCompleted: student.profileCompleted,
    });
  } catch {
    return apiError("Datos inválidos");
  }
}
