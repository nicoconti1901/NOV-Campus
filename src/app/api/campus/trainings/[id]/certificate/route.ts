import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { generateCertificatePdf } from "@/lib/capacitacion/certificate";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireStudent();
    const { id: trainingId } = await params;

    const [student, training, progress, passedAttempt] = await Promise.all([
      prisma.student.findUnique({ where: { id: session.studentId } }),
      prisma.training.findFirst({
        where: { id: trainingId, published: true },
        include: { room: true },
      }),
      prisma.trainingProgress.findUnique({
        where: {
          studentId_trainingId: {
            studentId: session.studentId!,
            trainingId,
          },
        },
      }),
      prisma.quizAttempt.findFirst({
        where: {
          studentId: session.studentId!,
          trainingId,
          passed: true,
        },
        orderBy: { attemptedAt: "desc" },
      }),
    ]);

    if (!student || !training) return apiError("Capacitación no encontrada", 404);

    const approved =
      progress?.status === PROGRESS_STATUS.COMPLETED || Boolean(passedAttempt);

    if (!approved) {
      return apiError("Debés aprobar la capacitación para obtener el certificado", 403);
    }

    // Restore completed status if it was overwritten by opening the course again
    if (progress && progress.status !== PROGRESS_STATUS.COMPLETED && passedAttempt) {
      await prisma.trainingProgress.update({
        where: { id: progress.id },
        data: {
          status: PROGRESS_STATUS.COMPLETED,
          score: passedAttempt.score,
          completedAt: progress.completedAt ?? passedAttempt.attemptedAt,
        },
      });
    }

    const studentName =
      [student.firstName, student.lastName].filter(Boolean).join(" ") || student.dni;
    const score = progress?.score ?? passedAttempt?.score ?? 0;
    const completedAt =
      progress?.completedAt ?? passedAttempt?.attemptedAt ?? new Date();

    const pdf = await generateCertificatePdf({
      studentName,
      studentDni: student.dni,
      trainingTitle: training.title,
      roomName: training.room.name,
      roomSlug: training.room.slug,
      courseMethod: "Virtual (Campus online)",
      score,
      completedAt,
      coverImageUrl: training.coverImage,
    });

    const filename = `certificado-${training.title
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+/g, "-")
      .toLowerCase()}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Certificate error:", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorized();
    }
    return apiError("No se pudo generar el certificado", 500);
  }
}
