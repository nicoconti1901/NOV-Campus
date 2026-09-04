import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { listDirectory } from "@/lib/capacitacion/matrix-service";

export async function GET() {
  try {
    await requireAdmin();
    const directory = await listDirectory();
    return NextResponse.json(directory);
  } catch {
    return unauthorized();
  }
}
