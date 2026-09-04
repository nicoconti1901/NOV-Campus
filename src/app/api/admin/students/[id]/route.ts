import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { unauthorized, apiError } from "@/lib/api";
import { formatDni, isValidDni } from "@/lib/capacitacion/utils";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { syncStudentAssignments } from "@/lib/capacitacion/matrix-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      progress: {
        include: { training: { include: { room: { select: { name: true, slug: true } } } } },
        orderBy: { updatedAt: "desc" },
      },
      attempts: {
        orderBy: { attemptedAt: "desc" },
        include: { training: true },
      },
      sede: true,
      puesto: true,
      tarea: true,
    },
  });

  if (!student) return apiError("Alumno no encontrado", 404);
  return NextResponse.json(student);
}

const studentSchema = z.object({
  dni: z.string().min(7).optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  sedeId: z.string().nullable().optional(),
  puestoId: z.string().nullable().optional(),
  tareaId: z.string().nullable().optional(),
  profileCompleted: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id } = await params;

  try {
    const body = studentSchema.parse(await request.json());
    const data: Record<string, unknown> = {};

    if (body.dni !== undefined) {
      const normalized = formatDni(body.dni);
      if (!isValidDni(normalized)) return apiError("DNI inválido");
      const conflict = await prisma.student.findFirst({
        where: { dni: normalized, NOT: { id } },
      });
      if (conflict) return apiError("Ya existe un alumno con ese DNI");
      data.dni = normalized;
    }

    if (body.firstName !== undefined) data.firstName = body.firstName?.trim() || null;
    if (body.lastName !== undefined) data.lastName = body.lastName?.trim() || null;
    if (body.email !== undefined) data.email = body.email?.trim() || null;
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null;
    if (body.company !== undefined) data.company = body.company?.trim() || null;
    if (body.sedeId !== undefined) data.sedeId = body.sedeId || null;
    if (body.puestoId !== undefined) data.puestoId = body.puestoId || null;
    if (body.tareaId !== undefined) data.tareaId = body.tareaId || null;
    if (body.profileCompleted !== undefined) data.profileCompleted = body.profileCompleted;

    const student = await prisma.student.update({
      where: { id },
      data,
      include: {
        progress: {
          include: { training: { include: { room: { select: { name: true, slug: true } } } } },
          orderBy: { updatedAt: "desc" },
        },
        sede: true,
        puesto: true,
        tarea: true,
      },
    });

    await syncStudentAssignments(student.id);

    return NextResponse.json(student);
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos inválidos");
    return apiError("No se pudo actualizar el alumno", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

const progressSchema = z.object({
  progressId: z.string().min(1),
  status: z.enum([
    PROGRESS_STATUS.NOT_STARTED,
    PROGRESS_STATUS.IN_PROGRESS,
    PROGRESS_STATUS.COMPLETED,
    PROGRESS_STATUS.FAILED,
  ]),
  score: z.number().min(0).max(100).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id: studentId } = await params;

  try {
    const body = await request.json();

    if (body?.action === "deleteProgress") {
      const progressId = z.string().min(1).parse(body.progressId);
      const existing = await prisma.trainingProgress.findFirst({
        where: { id: progressId, studentId },
      });
      if (!existing) return apiError("Progreso no encontrado", 404);
      await prisma.trainingProgress.delete({ where: { id: progressId } });
      return NextResponse.json({ ok: true });
    }

    const parsed = progressSchema.parse(body);
    const existing = await prisma.trainingProgress.findFirst({
      where: { id: parsed.progressId, studentId },
    });
    if (!existing) return apiError("Progreso no encontrado", 404);

    const progress = await prisma.trainingProgress.update({
      where: { id: parsed.progressId },
      data: {
        status: parsed.status,
        score: parsed.score ?? null,
        completedAt:
          parsed.status === PROGRESS_STATUS.COMPLETED || parsed.status === PROGRESS_STATUS.FAILED
            ? new Date()
            : null,
      },
      include: { training: { include: { room: true } } },
    });

    return NextResponse.json(progress);
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos inválidos");
    return apiError("No se pudo actualizar el progreso", 500);
  }
}
