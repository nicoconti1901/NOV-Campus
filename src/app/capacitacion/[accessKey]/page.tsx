import { notFound } from "next/navigation";
import { CampusLoginForm } from "@/components/capacitacion/CampusLoginForm";
import { CapacitacionBackground } from "@/components/capacitacion/CapacitacionBackground";
import { isValidCampusAccessKey } from "@/lib/capacitacion/access";

export default async function CampusAccessPage({
  params,
}: {
  params: Promise<{ accessKey: string }>;
}) {
  const { accessKey } = await params;

  if (!isValidCampusAccessKey(accessKey)) {
    notFound();
  }

  return (
    <CapacitacionBackground>
      <CampusLoginForm accessKey={accessKey} />
    </CapacitacionBackground>
  );
}
