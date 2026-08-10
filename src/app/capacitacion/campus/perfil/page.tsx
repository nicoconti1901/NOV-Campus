import { requireStudentPage } from "@/lib/capacitacion/auth-guards";
import { PerfilForm } from "@/components/capacitacion/PerfilForm";

export default async function PerfilPage() {
  await requireStudentPage();
  return <PerfilForm />;
}
