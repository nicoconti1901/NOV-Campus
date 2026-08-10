import { createWriteStream } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";
import {
  ALLOWED_EXT,
  MAX_BYTES,
  MAX_LABEL,
  UPLOAD_DIR,
  UPLOAD_TMP_DIR,
  isAllowedMimeForExt,
  isValidUploadId,
  sanitizeFileName,
} from "@/lib/capacitacion/upload";
import { MAX_CHUNK_BYTES } from "@/lib/capacitacion/upload-limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  try {
    const formData = await request.formData();
    const chunk = formData.get("chunk");
    const uploadId = String(formData.get("uploadId") || "");
    const fileName = String(formData.get("fileName") || "archivo");
    const chunkIndex = Number(formData.get("chunkIndex"));
    const totalChunks = Number(formData.get("totalChunks"));
    const totalSize = Number(formData.get("totalSize") || 0);

    if (!(chunk instanceof File)) {
      return apiError("Chunk requerido");
    }
    if (!isValidUploadId(uploadId)) {
      return apiError("uploadId inválido");
    }
    if (
      !Number.isInteger(chunkIndex) ||
      !Number.isInteger(totalChunks) ||
      chunkIndex < 0 ||
      totalChunks < 1 ||
      chunkIndex >= totalChunks ||
      totalChunks > 512
    ) {
      return apiError("Metadatos de chunk inválidos");
    }
    if (!Number.isFinite(totalSize) || totalSize <= 0 || totalSize > MAX_BYTES) {
      return apiError(`El archivo supera el máximo permitido (${MAX_LABEL})`);
    }
    if (chunk.size <= 0 || chunk.size > MAX_CHUNK_BYTES) {
      return apiError("Tamaño de chunk inválido");
    }

    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return apiError("Tipo de archivo no permitido");
    }
    const mime = (chunk.type || String(formData.get("mime") || "")).toLowerCase();
    if (!isAllowedMimeForExt(mime, ext)) {
      return apiError("Tipo MIME no permitido");
    }

    const tmpDir = path.join(UPLOAD_TMP_DIR, uploadId);
    await mkdir(tmpDir, { recursive: true });

    const partPath = path.join(tmpDir, `${chunkIndex}.part`);
    const bytes = Buffer.from(await chunk.arrayBuffer());
    await writeFile(partPath, bytes);

    // Aún faltan partes
    if (chunkIndex < totalChunks - 1) {
      return NextResponse.json({
        ok: true,
        received: chunkIndex,
        remaining: totalChunks - chunkIndex - 1,
      });
    }

    // Último chunk: ensamblar en orden
    await mkdir(UPLOAD_DIR, { recursive: true });
    const safeName = `${Date.now()}-${sanitizeFileName(fileName)}`;
    const dest = path.join(UPLOAD_DIR, safeName);
    await new Promise<void>((resolve, reject) => {
      const ws = createWriteStream(dest);
      ws.on("error", reject);
      ws.on("finish", () => resolve());

      void (async () => {
        try {
          let written = 0;
          for (let i = 0; i < totalChunks; i++) {
            const part = await readFile(path.join(tmpDir, `${i}.part`));
            written += part.length;
            if (written > MAX_BYTES) {
              throw new Error("FILE_TOO_LARGE");
            }
            if (!ws.write(part)) {
              await new Promise<void>((r) => ws.once("drain", r));
            }
          }
          ws.end();
        } catch (err) {
          ws.destroy();
          reject(err instanceof Error ? err : new Error("ASSEMBLE_FAILED"));
        }
      })();
    });

    await rm(tmpDir, { recursive: true, force: true });

    return NextResponse.json({
      url: `/api/files/capacitaciones/${safeName}`,
      fileName,
    });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "FILE_TOO_LARGE") {
      return apiError(`El archivo supera el máximo permitido (${MAX_LABEL})`);
    }
    console.error("Chunk upload error:", err);
    return apiError("No se pudo subir el archivo", 500);
  }
}
