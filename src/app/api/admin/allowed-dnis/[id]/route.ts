import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { unauthorized, apiError } from "@/lib/api";
import { formatDni, isValidDni } from "@/lib/capacitacion/utils";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const { id } = await params;
  await prisma.allowedDni.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

const updateSchema = z.object({
  dni: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
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
    const data: { dni?: string; enabled?: boolean } = {};

    if (body.dni !== undefined) {
      const normalized = formatDni(body.dni);
      if (!isValidDni(normalized)) return apiError("DNI inválido");
      const conflict = await prisma.allowedDni.findFirst({
        where: { dni: normalized, NOT: { id } },
      });
      if (conflict) return apiError("Ese DNI ya está habilitado");
      data.dni = normalized;
    }

    if (body.enabled !== undefined) data.enabled = body.enabled;

    const updated = await prisma.allowedDni.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos inválidos");
    return apiError("No se pudo actualizar el DNI", 500);
  }
}
