import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { listDirectory, syncStudentAssignments } from "@/lib/capacitacion/matrix-service";

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  sedeId: z.string().min(1),
  puestoId: z.string().min(1),
  tareaId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await requireStudent();
    const [student, directory] = await Promise.all([
      prisma.student.findUnique({
        where: { id: session.studentId },
        include: { sede: true, puesto: true, tarea: true },
      }),
      listDirectory(),
    ]);
    if (!student) return apiError("Alumno no encontrado", 404);
    return NextResponse.json({ student, directory });
  } catch {
    return unauthorized();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStudent();
    const body = profileSchema.parse(await request.json());

    const [sede, puesto, tarea] = await Promise.all([
      prisma.sede.findFirst({ where: { id: body.sedeId, active: true } }),
      prisma.puesto.findFirst({ where: { id: body.puestoId, active: true } }),
      prisma.tarea.findFirst({ where: { id: body.tareaId, active: true } }),
    ]);
    if (!sede || !puesto || !tarea) {
      return apiError("Sector, puesto o tarea inválidos");
    }

    const student = await prisma.student.update({
      where: { id: session.studentId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        sedeId: body.sedeId,
        puestoId: body.puestoId,
        tareaId: body.tareaId,
        profileCompleted: true,
      },
      include: { sede: true, puesto: true, tarea: true },
    });

    await syncStudentAssignments(student.id);

    return NextResponse.json(student);
  } catch (e) {
    if (e instanceof z.ZodError) return apiError("Datos personales inválidos");
    return unauthorized();
  }
}
