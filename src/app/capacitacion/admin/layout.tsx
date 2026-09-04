import { AdminShell } from "@/components/capacitacion/AdminShell";
import { getSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return <AdminShell role={session.adminRole ?? null}>{children}</AdminShell>;
}
