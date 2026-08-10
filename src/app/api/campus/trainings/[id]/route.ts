import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { parseMaterialsViewed } from "@/lib/capacitacion/materials";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStudent();
    const { id } = await params;

    const training = await prisma.training.findFirst({
      where: { id, published: true },
      include: {
        room: true,
        materials: { orderBy: { sortOrder: "asc" } },
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              select: { id: true, text: true },
            },
          },
        },
        progress: {
          where: { studentId: session.studentId },
        },
      },
    });

    if (!training) return apiError("Capacitación no encontrada", 404);

    const progress = training.progress[0];
    const materialsViewed = parseMaterialsViewed(progress?.materialsViewed);
    const isFinished =
      progress?.status === PROGRESS_STATUS.COMPLETED ||
      progress?.status === PROGRESS_STATUS.FAILED;

    if (!progress) {
      await prisma.trainingProgress.create({
        data: {
          studentId: session.studentId!,
          trainingId: id,
          status: PROGRESS_STATUS.IN_PROGRESS,
        },
      });
    } else if (!isFinished) {
      await prisma.trainingProgress.update({
        where: {
          studentId_trainingId: {
            studentId: session.studentId!,
            trainingId: id,
          },
        },
        data: { status: PROGRESS_STATUS.IN_PROGRESS },
      });
    }

    return NextResponse.json({
      ...training,
      materialsViewed,
      progressStatus: progress?.status ?? PROGRESS_STATUS.IN_PROGRESS,
      progressScore: progress?.score ?? null,
    });
  } catch {
    return unauthorized();
  }
}
