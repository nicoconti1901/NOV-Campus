import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { applyScopeToPublishedMatrix, getProgressKpis } from "@/lib/capacitacion/matrix-service";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const [matrix, kpis] = await Promise.all([
    prisma.annualMatrix.findFirst({
      where: { status: "published" },
      orderBy: { year: "desc" },
      include: {
        cells: {
          include: {
            sede: true,
            puesto: true,
            tarea: true,
            items: {
              include: { training: { select: { id: true, title: true, published: true } } },
            },
            _count: { select: { assignments: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    }),
    getProgressKpis(),
  ]);

  return NextResponse.json({ matrix, kpis });
}

const cellSchema = z.object({
  trainingId: z.string().min(1),
  sedeId: z.string().min(1),
  puestoId: z.string().min(1),
  tareaId: z.string().min(1),
  validityDays: z.number().int().min(1).max(3650),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  try {
    const body = cellSchema.parse(await request.json());
    const training = await prisma.training.findUnique({
      where: { id: body.trainingId },
      select: { id: true },
    });
    if (!training) return apiError("Capacitación no encontrada", 404);

    const result = await applyScopeToPublishedMatrix(body);
    if (result.skipped) {
      return apiError(
        result.reason === "no_published_matrix"
          ? "No hay una matriz anual publicada"
          : "Alcance incompleto"
      );
    }
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos de celda inválidos");
    return apiError("No se pudo actualizar la matriz", 500);
  }
}
