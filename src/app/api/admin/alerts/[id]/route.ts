import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";

const schema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).optional(),
  severity: z.enum(["info", "warning", "danger"]).optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const body = await req.json();
  const data = schema.parse(body);
  const alert = await prisma.alert.update({
    where: { id },
    data: {
      ...data,
      expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined,
    },
  });
  return NextResponse.json(alert);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  await prisma.alert.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
