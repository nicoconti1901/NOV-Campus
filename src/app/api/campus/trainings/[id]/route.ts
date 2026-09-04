import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { parseMaterialsViewed } from "@/lib/capacitacion/materials";
import { studentHasAssignment } from "@/lib/capacitacion/matrix-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStudent();
    const { id: trainingId } = await params;

    const assignment = await studentHasAssignment(session.studentId!, trainingId);
    if (!assignment) return apiError("Esta capacitación no está asignada a tu puesto", 403);

    const training = await prisma.training.findFirst({
      where: { id: trainingId, published: true },
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
      progress?.status === PROGRESS_STATUS.COMPLETED && assignment.status !== "expired";

    if (!progress) {
      await prisma.trainingProgress.create({
        data: {
          studentId: session.studentId!,
          trainingId,
          status: PROGRESS_STATUS.IN_PROGRESS,
        },
      });
    } else if (!isFinished) {
      await prisma.trainingProgress.update({
        where: {
          studentId_trainingId: {
            studentId: session.studentId!,
            trainingId,
          },
        },
        data: {
          status:
            assignment.status === "expired" ? PROGRESS_STATUS.IN_PROGRESS : PROGRESS_STATUS.IN_PROGRESS,
        },
      });
    }

    return NextResponse.json({
      ...training,
      materialsViewed,
      progressStatus:
        assignment.status === "expired"
          ? "expired"
          : progress?.status ?? PROGRESS_STATUS.IN_PROGRESS,
      progressScore: progress?.score ?? null,
      assignmentStatus: assignment.status,
      dueAt: assignment.dueAt,
    });
  } catch {
    return unauthorized();
  }
}
