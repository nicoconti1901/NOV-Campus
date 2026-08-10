import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const session = await requireStudent();
    const rooms = await prisma.room.findMany({
      include: {
        trainings: {
          where: { published: true },
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

    return NextResponse.json(rooms);
  } catch {
    return unauthorized();
  }
}
