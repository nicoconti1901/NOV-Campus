"use client";

import { Suspense } from "react";
import { StaffLoginForm } from "@/components/capacitacion/StaffLoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <StaffLoginForm portal="trainer" />
    </Suspense>
  );
}
