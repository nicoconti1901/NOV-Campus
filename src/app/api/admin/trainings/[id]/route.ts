import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import {
  questionsHaveCorrectAnswers,
  trainingUpdateSchema,
} from "@/lib/capacitacion/training-schema";
import { applyScopeToPublishedMatrix } from "@/lib/capacitacion/matrix-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  const training = await prisma.training.findUnique({
    where: { id },
    include: {
      room: true,
      materials: { orderBy: { sortOrder: "asc" } },
        questions: {
          orderBy: { sortOrder: "asc" },
          include: { options: true },
        },
        scopes: {
          include: { sede: true, puesto: true, tarea: true },
        },
    },
  });

  if (!training) return apiError("Capacitación no encontrada", 404);
  return NextResponse.json(training);
}

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
    const body = trainingUpdateSchema.parse(await request.json());

    if (!questionsHaveCorrectAnswers(body.questions)) {
      return apiError("Cada pregunta debe tener al menos una respuesta correcta");
    }

    const existing = await prisma.training.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return apiError("Capacitación no encontrada", 404);

    const training = await prisma.$transaction(async (tx) => {
      await tx.material.deleteMany({ where: { trainingId: id } });
      await tx.questionOption.deleteMany({
        where: { question: { trainingId: id } },
      });
      await tx.question.deleteMany({ where: { trainingId: id } });

      return tx.training.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          coverImage: body.coverImage ?? null,
          roomId: body.roomId,
          minPassScore: body.minPassScore,
          published: body.published,
          validityDays: body.validityDays ?? body.scope.validityDays,
          materials: {
            create: body.materials.map((m, i) => ({
              type: m.type,
              title: m.title,
              fileUrl: m.fileUrl,
              sortOrder: i,
            })),
          },
          questions: {
            create: body.questions.map((q, qi) => ({
              text: q.text,
              sortOrder: qi,
              options: {
                create: q.options.map((o) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
              },
            })),
          },
        },
        include: {
          room: true,
          materials: true,
          questions: { include: { options: true } },
          scopes: true,
        },
      });
    });

    await applyScopeToPublishedMatrix({
      trainingId: id,
      sedeId: body.scope.sedeId,
      puestoId: body.scope.puestoId,
      tareaId: body.scope.tareaId,
      validityDays: body.scope.validityDays,
    });

    return NextResponse.json(training);
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos inválidos");
    return apiError("No se pudo actualizar", 500);
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
  try {
    await prisma.training.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return apiError("No se pudo eliminar la capacitación", 500);
  }
}
