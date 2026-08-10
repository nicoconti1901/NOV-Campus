import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { slugify } from "@/lib/capacitacion/utils";

const updateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
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
    const body = updateSchema.parse(await request.json());
    const slug = slugify(body.slug || body.name);
    if (!slug) return apiError("Slug inválido");

    const conflict = await prisma.room.findFirst({
      where: { slug, NOT: { id } },
    });
    if (conflict) return apiError("Ya existe una sala con ese identificador");

    const room = await prisma.room.update({
      where: { id },
      data: { name: body.name.trim(), slug },
      include: { _count: { select: { trainings: true } } },
    });

    return NextResponse.json(room);
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos inválidos");
    return apiError("No se pudo actualizar la sala", 500);
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

  const room = await prisma.room.findUnique({
    where: { id },
    include: { _count: { select: { trainings: true } } },
  });

  if (!room) return apiError("Sala no encontrada", 404);

  // Cascade deletes trainings via schema relation
  await prisma.room.delete({ where: { id } });
  return NextResponse.json({
    ok: true,
    deletedTrainings: room._count.trainings,
  });
}
