import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export async function GET() {
  try {
    const session = await requireStudent();
    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
    });
    if (!student) return apiError("Alumno no encontrado", 404);
    return NextResponse.json(student);
  } catch {
    return unauthorized();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStudent();
    const body = profileSchema.parse(await request.json());

    const student = await prisma.student.update({
      where: { id: session.studentId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        profileCompleted: true,
      },
    });

    return NextResponse.json(student);
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos personales inválidos");
    return unauthorized();
  }
}
