import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCampusLoginPath } from "@/lib/capacitacion/access";

export async function requireAdminPage() {
  const session = await getSession();
  if (!session.adminId) {
    redirect("/capacitacion/admin/login");
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
