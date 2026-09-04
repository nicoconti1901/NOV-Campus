import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getCampusLoginPath } from "@/lib/capacitacion/access";
import { COMPANY_LOGIN, TRAINER_LOGIN, isCompanyRole } from "@/lib/capacitacion/admin-access";

async function adminRoleFor(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { role: true },
  });
  return admin?.role ?? null;
}

export async function requireAdminPage() {
  const session = await getSession();
  if (!session.adminId) {
    redirect(TRAINER_LOGIN);
  }
  const role = session.adminRole ?? (await adminRoleFor(session.adminId));
  if (!role) {
    redirect(TRAINER_LOGIN);
  }
  if (isCompanyRole(role)) {
    redirect("/capacitacion/admin/progreso");
  }
  return session;
}

export async function requireProgressPage() {
  const session = await getSession();
  if (!session.adminId) {
    redirect(COMPANY_LOGIN);
  }
  const role = session.adminRole ?? (await adminRoleFor(session.adminId));
  if (!role) {
    redirect(COMPANY_LOGIN);
  }
  return session;
}

export async function requireStudentPage() {
  const session = await getSession();
  if (!session.studentId) {
    redirect(getCampusLoginPath());
  }
  return session;
}
