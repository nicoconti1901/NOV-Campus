import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/session";
import { unauthorized } from "@/lib/api";
import { listDirectory } from "@/lib/capacitacion/matrix-service";

export async function GET() {
  try {
    await requireStudent();
    const directory = await listDirectory();
    return NextResponse.json(directory);
  } catch {
    return unauthorized();
  }
}
