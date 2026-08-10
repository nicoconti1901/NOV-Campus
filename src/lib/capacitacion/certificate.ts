import { jsPDF } from "jspdf";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { professional } from "@/lib/data";
import { getRoomTheme } from "@/lib/capacitacion/rooms";
import { formatDniDisplay } from "@/lib/capacitacion/utils";

export type CertificateData = {
  studentName: string;
  studentDni: string;
  trainingTitle: string;
  roomName: string;
  roomSlug: string;
  courseMethod: string;
  score: number;
  completedAt: Date;
  coverImageUrl?: string | null;
};

const BRAND = {
  red: [255, 140, 0] as const,
  redDark: [230, 122, 0] as const,
  dark: [10, 10, 18] as const,
  gray: [88, 89, 91] as const,
  grayLight: [138, 139, 141] as const,
  white: [255, 255, 255] as const,
};

function resolveSealImagePath(coverImageUrl: string | null | undefined, roomSlug: string): string | null {
  if (coverImageUrl) {
    if (coverImageUrl.startsWith("/api/files/")) {
      const relative = coverImageUrl.replace(/^\/api\/files\//, "");
      const parts = relative.split("/").filter((p) => p && p !== ".." && !p.includes("\0"));
      const uploadPath = path.resolve(process.cwd(), "uploads", ...parts);
      const root = path.resolve(process.cwd(), "uploads");
      if (uploadPath.startsWith(root + path.sep) && fs.existsSync(uploadPath)) {
        return uploadPath;
      }
    } else if (coverImageUrl.startsWith("/") && !coverImageUrl.includes("..")) {
      const publicPath = path.resolve(process.cwd(), "public", coverImageUrl.replace(/^\//, ""));
      const publicRoot = path.resolve(process.cwd(), "public");
      if (publicPath.startsWith(publicRoot + path.sep) && fs.existsSync(publicPath)) {
        return publicPath;
      }
    }
  }

  const theme = getRoomTheme(roomSlug);
  const roomPath = path.join(process.cwd(), "public", theme.coverImage.replace(/^\//, ""));
  return fs.existsSync(roomPath) ? roomPath : null;
}

async function loadLogoBase64(): Promise<string | null> {
  const logoPath = path.join(process.cwd(), "public", "images", "logo.jpeg");
  if (!fs.existsSync(logoPath)) return null;
  const png = await sharp(logoPath).resize({ width: 520, withoutEnlargement: true }).png().toBuffer();
  return png.toString("base64");
}

async function loadSealBase64(imagePath: string): Promise<string | null> {
  // El stroke del SVG se dibuja a ambos lados del radio: si el anillo toca el borde
  // del canvas se recorta en 12, 3, 6 y 9. Dejamos margen = mitad del stroke + padding.
  const photoSize = 260;
  const redStroke = 10;
  const grayStroke = 3;
  const gap = 4;
  const margin = Math.ceil(redStroke / 2) + 4;
  const ringBand = grayStroke + gap + redStroke;
  const pad = margin + ringBand;
  const canvas = photoSize + pad * 2;
  const cx = canvas / 2;
  const cy = canvas / 2;
  const photoR = photoSize / 2;

  const circleMask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${photoSize}" height="${photoSize}">
      <circle cx="${photoR}" cy="${photoR}" r="${photoR}" fill="#fff"/>
    </svg>`
  );

  const photo = await sharp(imagePath)
    .resize(photoSize, photoSize, { fit: "cover", position: "centre" })
    .ensureAlpha()
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const grayR = photoR + grayStroke / 2 + 1;
  const redR = photoR + grayStroke + gap + redStroke / 2;

  const ringSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}">
      <circle cx="${cx}" cy="${cy}" r="${redR}" fill="none" stroke="rgb(255,140,0)" stroke-width="${redStroke}"/>
      <circle cx="${cx}" cy="${cy}" r="${grayR}" fill="none" stroke="rgb(88,89,91)" stroke-width="${grayStroke}"/>
    </svg>`
  );

  const sealed = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: photo, left: pad, top: pad },
      { input: ringSvg, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  return sealed.toString("base64");
}

async function loadSignaturePngBase64(filePath: string): Promise<string | null> {
  if (!fs.existsSync(filePath)) return null;

  // Mantener RGBA (4 canales): grayscale+raw deja 1 canal y rompe el buffer
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .normalise({ lower: 2, upper: 98 })
    .linear(1.55, -50)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  if (channels < 4) return null;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luminance > 205) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }

    const inkStrength = Math.min(255, Math.round((205 - luminance) * 1.55));
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = inkStrength < 40 ? 0 : inkStrength;
  }

  const png = await sharp(data, {
    raw: { width: info.width, height: info.height, channels },
  })
    .png()
    .toBuffer();

  return png.toString("base64");
}

function drawCornerDecor(doc: jsPDF, w: number, h: number) {
  const [rr, rg, rb] = BRAND.red;
  const [dr, dg, db] = BRAND.dark;
  const [gr, gg, gb] = BRAND.gray;

  // Outer filled edge bands
  doc.setFillColor(rr, rg, rb);
  doc.rect(0, 0, 8, h, "F");
  doc.rect(w - 8, 0, 8, h, "F");

  // Top-left geometric stack
  doc.setFillColor(dr, dg, db);
  doc.triangle(0, 0, 52, 0, 0, 52, "F");
  doc.setFillColor(rr, rg, rb);
  doc.triangle(0, 0, 34, 0, 0, 34, "F");
  doc.setFillColor(gr, gg, gb);
  doc.triangle(8, 0, 22, 0, 8, 18, "F");

  // Top-right
  doc.setFillColor(dr, dg, db);
  doc.triangle(w, 0, w - 52, 0, w, 52, "F");
  doc.setFillColor(rr, rg, rb);
  doc.triangle(w, 0, w - 34, 0, w, 34, "F");
  doc.setFillColor(gr, gg, gb);
  doc.triangle(w - 8, 0, w - 22, 0, w - 8, 18, "F");

  // Bottom-left
  doc.setFillColor(dr, dg, db);
  doc.triangle(0, h, 52, h, 0, h - 52, "F");
  doc.setFillColor(rr, rg, rb);
  doc.triangle(0, h, 34, h, 0, h - 34, "F");
  doc.setFillColor(gr, gg, gb);
  doc.triangle(8, h, 22, h, 8, h - 18, "F");

  // Bottom-right
  doc.setFillColor(dr, dg, db);
  doc.triangle(w, h, w - 52, h, w, h - 52, "F");
  doc.setFillColor(rr, rg, rb);
  doc.triangle(w, h, w - 34, h, w, h - 34, "F");
  doc.setFillColor(gr, gg, gb);
  doc.triangle(w - 8, h, w - 22, h, w - 8, h - 18, "F");

  // Side ribbon accents
  doc.setFillColor(rr, rg, rb);
  doc.triangle(0, h / 2 - 28, 14, h / 2, 0, h / 2 + 28, "F");
  doc.triangle(w, h / 2 - 28, w - 14, h / 2, w, h / 2 + 28, "F");
  doc.setFillColor(gr, gg, gb);
  doc.triangle(0, h / 2 - 14, 8, h / 2, 0, h / 2 + 14, "F");
  doc.triangle(w, h / 2 - 14, w - 8, h / 2, w, h / 2 + 14, "F");

  // Inner double frame
  doc.setDrawColor(rr, rg, rb);
  doc.setLineWidth(1.2);
  doc.rect(16, 14, w - 32, h - 28);
  doc.setDrawColor(gr, gg, gb);
  doc.setLineWidth(0.4);
  doc.rect(19, 17, w - 38, h - 34);
}

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(...BRAND.white);
  doc.rect(0, 0, w, h, "F");
  drawCornerDecor(doc, w, h);

  const sealPath = resolveSealImagePath(data.coverImageUrl, data.roomSlug);
  const [logoBase64, roomSealBase64] = await Promise.all([
    loadLogoBase64(),
    sealPath ? loadSealBase64(sealPath) : Promise.resolve(null),
  ]);

  if (logoBase64) {
    doc.addImage(`data:image/png;base64,${logoBase64}`, "PNG", 34, 28, 44, 14.5);
  }

  if (roomSealBase64) {
    doc.addImage(`data:image/png;base64,${roomSealBase64}`, "PNG", w - 62, 26, 28, 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.gray);
    const roomLabel = doc.splitTextToSize(data.roomName.toUpperCase(), 40);
    doc.text(roomLabel, w - 48, 57, { align: "center" });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...BRAND.dark);
  doc.text("CERTIFICADO", w / 2, 42, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(...BRAND.red);
  doc.text("DE CAPACITACIÓN", w / 2, 52, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.grayLight);
  doc.text("OTORGADO A:", w / 2, 64, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.dark);
  const nameLines = doc.splitTextToSize(data.studentName.toUpperCase(), w - 80);
  doc.text(nameLines, w / 2, 76, { align: "center" });

  const afterNameY = 76 + (nameLines.length - 1) * 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.gray);
  doc.text(`DNI: ${formatDniDisplay(data.studentDni)}`, w / 2, afterNameY + 8, {
    align: "center",
  });

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND.dark);
  const body = `Por haber completado satisfactoriamente la capacitación "${data.trainingTitle}" correspondiente al área de ${data.roomName}, bajo la modalidad ${data.courseMethod}, obteniendo un puntaje de ${data.score}%, en el Campus Virtual de formación profesional.`;
  const bodyLines = doc.splitTextToSize(body, w - 95);
  doc.text(bodyLines, w / 2, afterNameY + 20, { align: "center" });

  const afterBodyY = afterNameY + 20 + bodyLines.length * 6.2;

  const dateStr = data.completedAt
    .toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.gray);
  doc.text(dateStr, w / 2, afterBodyY + 10, { align: "center" });

  const signatureCandidates = [
    path.join(process.cwd(), "public", "firma.jpeg"),
    path.join(process.cwd(), "public", "firma.jpg"),
    path.join(process.cwd(), "public", "certificate-signature.png"),
  ];
  const signaturePath = signatureCandidates.find((candidate) => fs.existsSync(candidate));
  const signatureBase64 = signaturePath ? await loadSignaturePngBase64(signaturePath) : null;

  const signatureTop = Math.min(Math.max(afterBodyY + 16, 128), h - 62);
  const sigCenterX = w / 2;

  if (signatureBase64) {
    doc.addImage(
      `data:image/png;base64,${signatureBase64}`,
      "PNG",
      sigCenterX - 38,
      signatureTop,
      76,
      30
    );
  } else {
    doc.setDrawColor(...BRAND.grayLight);
    doc.setLineWidth(0.4);
    doc.line(sigCenterX - 35, signatureTop + 22, sigCenterX + 35, signatureTop + 22);
  }

  doc.setDrawColor(...BRAND.grayLight);
  doc.setLineWidth(0.35);
  doc.line(sigCenterX - 42, signatureTop + 32, sigCenterX + 42, signatureTop + 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);
  doc.text(professional.name, sigCenterX, signatureTop + 38, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.gray);
  doc.text(professional.license, sigCenterX, signatureTop + 43, {
    align: "center",
  });

  return Buffer.from(doc.output("arraybuffer"));
}
