import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const session = await requireStudent();
    const assignments = await prisma.trainingAssignment.findMany({
      where: { studentId: session.studentId, training: { published: true } },
      select: { trainingId: true },
    });
    const assignedIds = assignments.map((a) => a.trainingId);
    if (assignedIds.length === 0) return NextResponse.json([]);

    const rooms = await prisma.room.findMany({
      include: {
        trainings: {
          where: { published: true, id: { in: assignedIds } },
          include: {
            progress: {
              where: { studentId: session.studentId },
            },
          },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(rooms.filter((room) => room.trainings.length > 0));
  } catch {
    return unauthorized();
  }
}
