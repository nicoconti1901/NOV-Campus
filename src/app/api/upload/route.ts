import { createWriteStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import Busboy from "busboy";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { apiError, unauthorized } from "@/lib/api";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "capacitaciones");
/** Videos de capacitación suelen superar 200 MB */
const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB
const MAX_LABEL = "1 GB";

const ALLOWED_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const ALLOWED_EXT = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ParsedUpload = {
  fileName: string;
  url: string;
};

async function streamMultipartUpload(request: NextRequest): Promise<ParsedUpload> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    throw new Error("INVALID_CONTENT_TYPE");
  }
  if (!request.body) {
    throw new Error("EMPTY_BODY");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const nodeBody = Readable.fromWeb(
    request.body as import("stream/web").ReadableStream
  );

  return new Promise<ParsedUpload>((resolve, reject) => {
    const busboy = Busboy({
      headers: { "content-type": contentType },
      limits: { files: 1, fileSize: MAX_BYTES },
    });

    let destPath = "";
    let originalName = "";
    let settled = false;
    let fileWork: Promise<void> | null = null;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      nodeBody.destroy();
      if (destPath) {
        void unlink(destPath).catch(() => undefined);
      }
      reject(err);
    };

    busboy.on("file", (fieldname, file, info) => {
      if (fieldname !== "file") {
        file.resume();
        return;
      }

      originalName = info.filename || "archivo";
      const ext = path.extname(originalName).toLowerCase();
      const mime = (info.mimeType || "").toLowerCase();

      if (!ALLOWED_EXT.has(ext)) {
        file.resume();
        fail(new Error("INVALID_EXT"));
        return;
      }
      if (mime && !ALLOWED_MIME.has(mime)) {
        file.resume();
        fail(new Error("INVALID_MIME"));
        return;
      }

      const safeName = `${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      destPath = path.join(UPLOAD_DIR, safeName);

      let limitHit = false;
      file.on("limit", () => {
        limitHit = true;
      });

      fileWork = pipeline(file, createWriteStream(destPath)).then(() => {
        if (limitHit) throw new Error("FILE_TOO_LARGE");
      });
    });

    busboy.on("error", (err: Error) => fail(err));

    busboy.on("finish", () => {
      void (async () => {
        try {
          if (!fileWork || !destPath) {
            fail(new Error("NO_FILE"));
            return;
          }
          await fileWork;
          if (settled) return;
          settled = true;
          resolve({
            fileName: originalName,
            url: `/api/files/capacitaciones/${path.basename(destPath)}`,
          });
        } catch (err) {
          fail(err instanceof Error ? err : new Error("UPLOAD_FAILED"));
        }
      })();
    });

    nodeBody.on("error", (err) => fail(err));
    nodeBody.pipe(busboy);
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorized();
  }

  try {
    const uploaded = await streamMultipartUpload(request);
    return NextResponse.json(uploaded);
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "FILE_TOO_LARGE") {
      return apiError(`El archivo supera el máximo permitido (${MAX_LABEL})`);
    }
    if (code === "INVALID_EXT") {
      return apiError("Tipo de archivo no permitido");
    }
    if (code === "INVALID_MIME") {
      return apiError("Tipo MIME no permitido");
    }
    if (code === "NO_FILE" || code === "EMPTY_BODY") {
      return apiError("Archivo requerido");
    }
    if (code === "INVALID_CONTENT_TYPE") {
      return apiError("Content-Type inválido");
    }
    console.error("Upload error:", err);
    return apiError("No se pudo subir el archivo", 500);
  }
}
