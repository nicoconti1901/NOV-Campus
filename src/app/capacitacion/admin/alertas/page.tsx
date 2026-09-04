import { requireAdminPage } from "@/lib/capacitacion/auth-guards";
import { AlertsManager } from "@/components/capacitacion/AlertsManager";

export default async function AdminAlertasPage() {
  await requireAdminPage();
  return <AlertsManager />;
}
