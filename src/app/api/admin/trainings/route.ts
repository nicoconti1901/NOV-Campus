import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import {
  questionsHaveCorrectAnswers,
  trainingCreateSchema,
} from "@/lib/capacitacion/training-schema";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const trainings = await prisma.training.findMany({
    include: {
      room: true,
      materials: { orderBy: { sortOrder: "asc" } },
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { options: true },
      },
      _count: { select: { progress: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(trainings);
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  try {
    const body = trainingCreateSchema.parse(await request.json());

    if (!questionsHaveCorrectAnswers(body.questions)) {
      return apiError("Cada pregunta debe tener al menos una respuesta correcta");
    }

    const training = await prisma.training.create({
      data: {
        title: body.title,
        description: body.description,
        coverImage: body.coverImage ?? null,
        roomId: body.roomId,
        minPassScore: body.minPassScore,
        published: body.published ?? false,
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
      },
    });

    return NextResponse.json(training, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos de capacitación inválidos");
    return apiError("No se pudo crear la capacitación", 500);
  }
}
