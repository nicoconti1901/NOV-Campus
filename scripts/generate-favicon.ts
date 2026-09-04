import fs from "fs";
import path from "path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "public", "images", "logo.jpeg");
const SCALE = 3;

function distWhite(r: number, g: number, b: number) {
  return Math.hypot(255 - r, 255 - g, 255 - b);
}

type Pt = { x: number; y: number };

function extendSwooshToRim(
  pixels: Buffer,
  w: number,
  h: number,
  cx: number,
  cy: number,
  radius: number
) {
  const r2 = radius * radius;

  const isSwoosh = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    const i = (y * w + x) * 4;
    return pixels[i] > 215 && pixels[i + 1] > 215 && pixels[i + 2] > 215 && pixels[i + 3] > 200;
  };

  const paint = (x: number, y: number, brush: number) => {
    const rr = Math.ceil(brush);
    for (let oy = -rr; oy <= rr; oy++) {
      for (let ox = -rr; ox <= rr; ox++) {
        if (ox * ox + oy * oy > brush * brush) continue;
        const px = Math.round(x + ox);
        const py = Math.round(y + oy);
        if (px < 0 || py < 0 || px >= w || py >= h) continue;
        const dx = px - cx;
        const dy = py - cy;
        if (dx * dx + dy * dy > r2) continue;
        const i = (py * w + px) * 4;
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
    }
  };

  const whites: Pt[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > r2) continue;
      if (isSwoosh(x, y)) whites.push({ x, y });
    }
  }
  if (whites.length < 20) return;

  const distC = (p: Pt) => Math.hypot(p.x - cx, p.y - cy);

  const localBrush = (p: Pt) => {
    let minY = p.y;
    let maxY = p.y;
    for (const q of whites) {
      if (Math.abs(q.x - p.x) <= 3) {
        if (q.y < minY) minY = q.y;
        if (q.y > maxY) maxY = q.y;
      }
    }
    return Math.max(2.4, (maxY - minY + 1) / 2.15);
  };

  const walkTo = (start: Pt, tx: number, ty: number, brush: number) => {
    const dx = tx - start.x;
    const dy = ty - start.y;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
    const nx = dx / steps;
    const ny = dy / steps;
    let x = start.x;
    let y = start.y;
    for (let i = 0; i <= steps; i++) {
      x += nx;
      y += ny;
      if (Math.hypot(x - cx, y - cy) >= radius - 0.45) {
        paint(x - nx * 0.3, y - ny * 0.3, Math.max(1.8, brush * 0.9));
        break;
      }
      const t = i / steps;
      paint(x, y, Math.max(1.8, brush * (1 - t * 0.25)));
    }
  };

  const leftPool = whites.filter((p) => p.x < cx && p.y > cy - radius * 0.15);
  const leftEnd = leftPool.reduce((best, p) => (distC(p) > distC(best) ? p : best), leftPool[0] ?? whites[0]);

  const rightPool = whites.filter((p) => p.x > cx && p.y > cy - radius * 0.22);
  const rightEnd = rightPool.reduce((best, p) => (p.x > best.x ? p : best), rightPool[0] ?? whites[0]);

  const leftDy = leftEnd.y - cy;
  const leftTx = cx - Math.sqrt(Math.max(0, r2 - leftDy * leftDy));
  walkTo(leftEnd, leftTx, leftEnd.y, localBrush(leftEnd));

  const rightDy = rightEnd.y - cy;
  const rightTx = cx + Math.sqrt(Math.max(0, r2 - rightDy * rightDy));
  const slope = -0.22;
  const dirLen = Math.hypot(1, slope);
  const nx = 1 / dirLen;
  const ny = slope / dirLen;
  let sx = rightEnd.x;
  let sy = rightEnd.y;
  const brush = Math.max(3.2, localBrush(rightEnd));
  for (let step = 0; step < Math.ceil(radius * 0.45); step++) {
    sx += nx;
    sy += ny;
    if (Math.hypot(sx - cx, sy - cy) >= radius * 1.055) {
      paint(sx - nx * 0.2, sy - ny * 0.2, Math.max(2, brush * 0.8));
      break;
    }
    paint(sx, sy, brush);
  }

  console.log("swoosh extend", {
    leftGap: Math.round(radius - distC(leftEnd)),
    rightGap: Math.round(rightTx - rightEnd.x),
  });
}

async function main() {
  const { data, info } = await sharp(SRC)
    .resize({ width: 866 * SCALE, kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const pixels = Buffer.from(data);

  let redMinX = w;
  let redMinY = h;
  let redMaxX = 0;
  let redMaxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      if (r > 180 && g < 110 && b < 110) {
        if (x < redMinX) redMinX = x;
        if (y < redMinY) redMinY = y;
        if (x > redMaxX) redMaxX = x;
        if (y > redMaxY) redMaxY = y;
      }
    }
  }

  const cx = (redMinX + redMaxX) / 2;
  const cy = (redMinY + redMaxY) / 2;
  const radius = Math.max(redMaxX - redMinX + 1, redMaxY - redMinY + 1) / 2;
  const protectR2 = radius * radius;
  const ringR2 = (radius * 1.075) * (radius * 1.075);

  const WHITE_KILL = 22;
  const WHITE_KEEP = 130;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      const i = (y * w + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const dw = distWhite(r, g, b);

      if (d2 <= protectR2) {
        pixels[i + 3] = 255;
        continue;
      }

      if (d2 <= ringR2 && dw < 85) {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
        continue;
      }

      if (dw <= WHITE_KILL) {
        pixels[i + 3] = 0;
      } else if (dw >= WHITE_KEEP) {
        pixels[i + 3] = 255;
      } else {
        pixels[i + 3] = Math.round((255 * (dw - WHITE_KILL)) / (WHITE_KEEP - WHITE_KILL));
      }
    }
  }

  extendSwooshToRim(pixels, w, h, cx, cy, radius);

  const hiRes = await sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  const wordmark = await sharp(hiRes)
    .trim({ threshold: 0 })
    .resize({ width: 1400, kernel: "lanczos3" })
    .png()
    .toBuffer();

  const publicImages = path.join(process.cwd(), "public", "images");
  const appDir = path.join(process.cwd(), "src", "app");
  const publicDir = path.join(process.cwd(), "public");
  fs.mkdirSync(publicImages, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });

  await sharp(wordmark).png().toFile(path.join(publicImages, "logo-on-dark.png"));

  const iconSquare = await sharp(wordmark)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
      <rect width="512" height="512" rx="96" fill="#1e2126"/>
    </svg>`
  );

  const favicon = await sharp(plate)
    .composite([
      {
        input: await sharp(iconSquare).resize(430, 430).png().toBuffer(),
        gravity: "centre",
      },
    ])
    .png()
    .toBuffer();

  await sharp(favicon).png().toFile(path.join(appDir, "icon.png"));
  await sharp(favicon).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));
  await sharp(favicon).resize(64, 64).png().toFile(path.join(publicDir, "favicon.png"));

  const meta = await sharp(wordmark).metadata();
  console.log("logo-on-dark", meta.width, meta.height, { cx, cy, radius: Math.round(radius) });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
