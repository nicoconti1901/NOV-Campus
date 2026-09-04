import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { scanAssignmentExpiries } from "@/lib/capacitacion/matrix-service";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  const result = await scanAssignmentExpiries();
  return NextResponse.json(result);
}
