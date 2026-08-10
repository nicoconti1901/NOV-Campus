import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import { formatDni, isValidDni } from "@/lib/capacitacion/utils";

function parseCsvDnis(raw: string): string[] {
  const lines = raw
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const dnis: string[] = [];
  for (const line of lines) {
    const firstCell = line.split(/[,;\t]/)[0]?.trim().replace(/^["']|["']$/g, "") ?? "";
    if (!firstCell || /^dni$/i.test(firstCell)) continue;
    const normalized = formatDni(firstCell);
    if (isValidDni(normalized)) dnis.push(normalized);
  }
  return [...new Set(dnis)];
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let raw = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return apiError("Archivo CSV requerido");
      }
      raw = await file.text();
    } else {
      const body = await request.json().catch(() => null);
      raw = typeof body?.csv === "string" ? body.csv : "";
    }

    if (!raw.trim()) {
      return apiError("El CSV está vacío");
    }

    const dnis = parseCsvDnis(raw);
    if (dnis.length === 0) {
      return apiError("No se encontraron DNIs válidos en el archivo");
    }

    let created = 0;
    let reenabled = 0;

    for (const dni of dnis) {
      const existing = await prisma.allowedDni.findUnique({ where: { dni } });
      if (!existing) {
        await prisma.allowedDni.create({ data: { dni } });
        created += 1;
      } else if (!existing.enabled) {
        await prisma.allowedDni.update({ where: { dni }, data: { enabled: true } });
        reenabled += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      total: dnis.length,
      created,
      reenabled,
      skipped: dnis.length - created - reenabled,
    });
  } catch {
    return apiError("No se pudo importar el CSV", 500);
  }
}
