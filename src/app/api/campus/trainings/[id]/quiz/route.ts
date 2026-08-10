import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { allMaterialsViewed, parseMaterialsViewed } from "@/lib/capacitacion/materials";

const schema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStudent();
    const { id: trainingId } = await params;
    const { answers } = schema.parse(await request.json());

    const training = await prisma.training.findFirst({
      where: { id: trainingId, published: true },
      include: {
        questions: { include: { options: true } },
      },
    });

    if (!training) return apiError("Capacitación no encontrada", 404);

    const progress = await prisma.trainingProgress.findUnique({
      where: {
        studentId_trainingId: {
          studentId: session.studentId!,
          trainingId,
        },
      },
    });

    if (progress?.status === PROGRESS_STATUS.COMPLETED) {
      return apiError("Ya aprobaste esta capacitación. Solo podés descargar el certificado.", 403);
    }

    const alreadyPassed = await prisma.quizAttempt.findFirst({
      where: {
        studentId: session.studentId!,
        trainingId,
        passed: true,
      },
      select: { id: true },
    });
    if (alreadyPassed) {
      return apiError("Ya aprobaste esta capacitación. Solo podés descargar el certificado.", 403);
    }

    const materialIds = await prisma.material.findMany({
      where: { trainingId },
      select: { id: true },
    });
    const viewed = parseMaterialsViewed(progress?.materialsViewed);
    if (!allMaterialsViewed(materialIds.map((m) => m.id), viewed)) {
      return apiError(
        "Debés completar todo el material didáctico antes de realizar la evaluación",
        403
      );
    }

    let correct = 0;
    const total = training.questions.length;

    for (const question of training.questions) {
      const selectedId = answers[question.id];
      const selected = question.options.find((o) => o.id === selectedId);
      if (selected?.isCorrect) correct += 1;
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= training.minPassScore;
    const bestScore = Math.max(progress?.score ?? 0, score);

    await prisma.quizAttempt.create({
      data: {
        studentId: session.studentId!,
        trainingId,
        score,
        passed,
        answers: JSON.stringify(answers),
      },
    });

    await prisma.trainingProgress.upsert({
      where: {
        studentId_trainingId: {
          studentId: session.studentId!,
          trainingId,
        },
      },
      update: {
        score: bestScore,
        status: passed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.FAILED,
        completedAt: passed ? new Date() : progress?.completedAt ?? null,
      },
      create: {
        studentId: session.studentId!,
        trainingId,
        score: bestScore,
        status: passed ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.FAILED,
        completedAt: passed ? new Date() : null,
      },
    });

    return NextResponse.json({ score, passed, minPassScore: training.minPassScore });
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Respuestas inválidas");
    return unauthorized();
  }
}
