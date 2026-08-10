import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { slugify } from "@/lib/capacitacion/utils";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const rooms = await prisma.room.findMany({
    include: { _count: { select: { trainings: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(rooms);
}

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  try {
    const body = createSchema.parse(await request.json());
    const slug = slugify(body.slug || body.name);
    if (!slug) return apiError("Slug inválido");

    const exists = await prisma.room.findUnique({ where: { slug } });
    if (exists) return apiError("Ya existe una sala con ese identificador");

    const room = await prisma.room.create({
      data: { name: body.name.trim(), slug },
      include: { _count: { select: { trainings: true } } },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos inválidos");
    return apiError("No se pudo crear la sala", 500);
  }
}
