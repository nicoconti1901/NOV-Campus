import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { parseMaterialsViewed } from "@/lib/capacitacion/materials";
import { studentHasAssignment } from "@/lib/capacitacion/matrix-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const session = await requireStudent();
    const { id: trainingId, materialId } = await params;

    const material = await prisma.material.findFirst({
      where: {
        id: materialId,
        training: { id: trainingId, published: true },
      },
    });

    if (!material) return apiError("Material no encontrado", 404);

    const assignment = await studentHasAssignment(session.studentId!, trainingId);
    if (!assignment) return apiError("Esta capacitación no está asignada a tu puesto", 403);

    const progress = await prisma.trainingProgress.findUnique({
      where: {
        studentId_trainingId: {
          studentId: session.studentId!,
          trainingId,
        },
      },
    });

    const viewed = parseMaterialsViewed(progress?.materialsViewed);
    if (!viewed.includes(materialId)) {
      viewed.push(materialId);
    }

    await prisma.trainingProgress.upsert({
      where: {
        studentId_trainingId: {
          studentId: session.studentId!,
          trainingId,
        },
      },
      update: { materialsViewed: JSON.stringify(viewed) },
      create: {
        studentId: session.studentId!,
        trainingId,
        status: "in_progress",
        materialsViewed: JSON.stringify(viewed),
      },
    });

    return NextResponse.json({ viewed });
  } catch {
    return unauthorized();
  }
}
