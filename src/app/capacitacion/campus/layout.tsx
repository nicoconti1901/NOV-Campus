"use client";

import { usePathname } from "next/navigation";
import { CapacitacionBackground } from "@/components/capacitacion/CapacitacionBackground";
import { CampusNav } from "@/components/capacitacion/CampusNav";

export default function CampusLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTrainingView = pathname.startsWith("/capacitacion/campus/capacitacion/");

  const shell = (
    <>
      <CampusNav
        subtitle="Campus virtual"
        title="Casino Club Campus"
        logoutEndpoint="/api/auth/student/logout"
        showCertificates
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );

  if (isTrainingView) {
    return <div className="min-h-screen bg-white">{shell}</div>;
  }

  return <CapacitacionBackground>{shell}</CapacitacionBackground>;
}
