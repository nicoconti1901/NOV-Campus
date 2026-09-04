import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { apiError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const admin = await prisma.admin.findUnique({ where: { email: body.email } });

    if (!admin || !(await bcrypt.compare(body.password, admin.passwordHash))) {
      return apiError("Credenciales incorrectas", 401);
    }

    const session = await getSession();
    session.adminId = admin.id;
    session.adminRole = admin.role;
    session.studentId = undefined;
    session.dni = undefined;
    await session.save();

    return NextResponse.json({ ok: true, role: admin.role });
  } catch {
    return apiError("Datos inválidos");
  }
}
