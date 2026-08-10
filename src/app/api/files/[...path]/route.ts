import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const STREAMABLE = new Set([".mp4", ".webm", ".mov", ".pdf"]);

function toWebStream(nodeStream: Readable) {
  return Readable.toWeb(nodeStream) as unknown as ReadableStream;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments?.length || segments.some((s) => s === ".." || s.includes("\0"))) {
    return new NextResponse("Archivo no encontrado", { status: 404 });
  }

  const filePath = path.resolve(UPLOADS_ROOT, ...segments);
  if (!filePath.startsWith(UPLOADS_ROOT + path.sep) && filePath !== UPLOADS_ROOT) {
    return new NextResponse("Archivo no encontrado", { status: 404 });
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new NextResponse("Archivo no encontrado", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    const fileSize = fileStat.size;
    const rangeHeader = request.headers.get("range");

    if (rangeHeader && STREAMABLE.has(ext)) {
      const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
      if (!match) {
        return new NextResponse("Range inválido", { status: 416 });
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : Math.min(start + 2 * 1024 * 1024 - 1, fileSize - 1);

      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start < 0 ||
        end < start ||
        start >= fileSize
      ) {
        return new NextResponse("Range inválido", {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }

      const safeEnd = Math.min(end, fileSize - 1);
      const chunkSize = safeEnd - start + 1;
      const stream = createReadStream(filePath, { start, end: safeEnd });

      return new NextResponse(toWebStream(stream), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${safeEnd}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // Sin Range: stream completo (evita cargar el archivo entero en RAM)
    const stream = createReadStream(filePath);
    return new NextResponse(toWebStream(stream), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Archivo no encontrado", { status: 404 });
  }
}
