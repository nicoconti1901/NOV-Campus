import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/capacitacion/auth-guards";

const schema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  severity: z.enum(["info", "warning", "danger"]).default("info"),
  active: z.boolean().default(true),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function GET() {
  await requireAdminPage();
  const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(alerts);
}

export async function POST(req: Request) {
  await requireAdminPage();
  const body = await req.json();
  const data = schema.parse(body);
  const alert = await prisma.alert.create({
    data: {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });
  return NextResponse.json(alert, { status: 201 });
}
