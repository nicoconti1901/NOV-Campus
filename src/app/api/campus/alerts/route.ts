import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudentPage } from "@/lib/capacitacion/auth-guards";

export async function GET() {
  await requireStudentPage();
  const now = new Date();
  const alerts = await prisma.alert.findMany({
    where: {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ severity: "desc" }, { publishedAt: "desc" }],
  });
  return NextResponse.json(alerts);
}
