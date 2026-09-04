import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CACHE = path.join(HERE, ".cache");
const OUT_DIR = path.join(ROOT, "docs");
const VIDEO_OUT = path.join(OUT_DIR, "recorrido-nov-campus.mp4");
const VIEWPORT = { width: 1600, height: 900 };

let CLIPS = [];

function loadEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

function probeDurationMs(file) {
  const result = spawnSync(ffmpegPath, ["-i", file], { encoding: "utf8" });
  const text = `${result.stdout || ""}\n${result.stderr || ""}`;
  const match = text.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return Math.round(
    (Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])) * 1000
  );
}

function installTour() {
  const STYLE_ID = "nov-tour-style";
  const ROOT_ID = "nov-tour-root";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #nov-tour-root { all: initial; pointer-events: none !important; }
      #nov-tour-root * { box-sizing: border-box; font-family: Inter, Segoe UI, system-ui, sans-serif; }
      #nov-tour-spot {
        position: fixed; pointer-events: none !important; z-index: 2147483645;
        border: 3px solid #ED3229; border-radius: 16px;
        box-shadow: 0 0 0 9999px rgba(15,23,42,.42), 0 0 28px rgba(237,50,41,.55);
        transition: top .18s ease, left .18s ease, width .18s ease, height .18s ease, opacity .18s ease;
        opacity: 0;
      }
      #nov-tour-cursor {
        position: fixed; width: 18px; height: 18px; margin-left: -9px; margin-top: -9px;
        border: 2px solid #fff; background: #ED3229; border-radius: 999px;
        box-shadow: 0 0 0 4px rgba(237,50,41,.28); pointer-events: none; z-index: 2147483647;
        transition: transform .08s linear;
      }
      #nov-tour-caption {
        position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);
        width: min(980px, calc(100vw - 40px)); pointer-events: none; z-index: 2147483646;
        background: rgba(30,33,38,.94); color: #fff; border-radius: 16px; padding: 14px 20px 14px 18px;
        border-left: 5px solid #ED3229; box-shadow: 0 18px 40px rgba(15,23,42,.35);
        font-size: 17px; line-height: 1.4; letter-spacing: .01em;
      }
      #nov-tour-section {
        position: fixed; top: 76px; right: 18px; pointer-events: none; z-index: 2147483646;
        background: rgba(30,33,38,.92); color: #fff; border-radius: 999px;
        padding: 8px 14px; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
        border: 1px solid rgba(255,255,255,.16);
      }
    `;
    document.documentElement.appendChild(style);
  }
  if (!document.getElementById(ROOT_ID)) {
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = `
      <div id="nov-tour-spot"></div>
      <div id="nov-tour-cursor"></div>
      <div id="nov-tour-section"></div>
      <div id="nov-tour-caption"></div>
    `;
    document.documentElement.appendChild(root);
    document.addEventListener(
      "mousemove",
      (event) => {
        const cursor = document.getElementById("nov-tour-cursor");
        if (!cursor) return;
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      },
      true
    );
  }
  window.__novTour = {
    setSection(text) {
      const el = document.getElementById("nov-tour-section");
      if (el) el.textContent = text || "";
    },
    setCaption(text) {
      const el = document.getElementById("nov-tour-caption");
      if (el) el.textContent = text || "";
    },
    spotlight(box) {
      const el = document.getElementById("nov-tour-spot");
      if (!el || !box) return;
      const pad = 8;
      el.style.left = `${Math.max(8, box.x - pad)}px`;
      el.style.top = `${Math.max(8, box.y - pad)}px`;
      el.style.width = `${box.width + pad * 2}px`;
      el.style.height = `${box.height + pad * 2}px`;
      el.style.opacity = "1";
    },
    clearSpot() {
      const el = document.getElementById("nov-tour-spot");
      if (el) el.style.opacity = "0";
    },
  };
}

async function ready(page) {
  await page.evaluate(installTour).catch(() => undefined);
}

async function firstVisible(locator, timeout = 6000) {
  try {
    const target = locator.first();
    await target.waitFor({ state: "visible", timeout });
    return target;
  } catch {
    return null;
  }
}

function labeledControl(page, name) {
  return page
    .locator("label")
    .filter({ hasText: name })
    .locator("xpath=..")
    .locator("input, textarea, select")
    .first();
}

async function spotlight(page, locator) {
  if (!locator) {
    await page.evaluate(() => window.__novTour?.clearSpot?.());
    return;
  }
  try {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) return;
    const x = box.x + Math.min(box.width / 2, 120);
    const y = box.y + Math.min(box.height / 2, 28);
    await page.mouse.move(x, y, { steps: 8 });
    await page.evaluate((rect) => window.__novTour?.spotlight?.(rect), box);
  } catch {
    await page.evaluate(() => window.__novTour?.clearSpot?.());
  }
}

function pathnameOf(page) {
  return new URL(page.url()).pathname.replace(/\/$/, "") || "/";
}

async function waitShown(locator, timeout = 25000) {
  await locator.first().waitFor({ state: "visible", timeout });
}

async function arrive(page, href, locator) {
  const target = new URL(href).pathname.replace(/\/$/, "");
  if (pathnameOf(page) !== target) {
    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  if (locator) await waitShown(locator);
  await ready(page);
}

async function loginAdmin(page, env, destPath, readyLocator) {
  await page.request.post(`${env.base}/api/auth/admin/login`, {
    data: { email: env.adminEmail, password: env.adminPassword },
  });
  const visible = await readyLocator
    .first()
    .waitFor({ state: "visible", timeout: 2500 })
    .then(() => true)
    .catch(() => false);
  if (!visible) {
    await page.goto(`${env.base}${destPath}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  await waitShown(readyLocator, 25000);
  if (pathnameOf(page).includes("/login")) {
    await page.goto(`${env.base}${destPath}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitShown(readyLocator, 25000);
  }
  await ready(page);
}

async function loginStudent(page, env, readyLocator) {
  await page.request.post(`${env.base}/api/auth/student/login`, {
    data: { dni: env.studentDni, accessKey: env.accessKey },
  });
  const visible = await readyLocator
    .first()
    .waitFor({ state: "visible", timeout: 2500 })
    .then(() => true)
    .catch(() => false);
  if (!visible) {
    await page.goto(`${env.base}/capacitacion/campus`, { waitUntil: "domcontentloaded", timeout: 60000 });
  }
  await waitShown(readyLocator, 25000);
  if (pathnameOf(page).includes("nov2026") || pathnameOf(page).includes("/login")) {
    await page.goto(`${env.base}/capacitacion/campus`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitShown(readyLocator, 25000);
  }
  await ready(page);
}

function createHelpers(page, durations, timeline, startedAt) {
  return {
    async section(text) {
      await page.evaluate((value) => window.__novTour?.setSection?.(value), text);
    },
    async speak(id, locator) {
      const clip = CLIPS.find((item) => item.id === id);
      if (!clip) throw new Error(`missing clip ${id}`);
      await page.evaluate((value) => window.__novTour?.setCaption?.(value), clip.text);
      if (locator) await spotlight(page, locator);
      timeline.events.push({ id, startMs: Date.now() - startedAt.value });
      const waitMs = (durations[id] || 4000) + 280;
      await page.waitForTimeout(waitMs);
    },
    async click(locator) {
      if (!locator) return;
      await spotlight(page, locator);
      try {
        await locator.click({ force: true, timeout: 4000 });
      } catch {}
      await ready(page);
    },
    async type(locator, text) {
      if (!locator) return;
      try {
        await spotlight(page, locator);
        await locator.click({ force: true, timeout: 4000 });
        await locator.fill(text, { timeout: 4000 });
      } catch {}
    },
  };
}

async function runTour(page, durations, timeline, startedAt, env) {
  const { speak, section, click, type } = createHelpers(page, durations, timeline, startedAt);
  const base = env.base;
  const by = (fn) => firstVisible(fn(page));
  const heading = (name) => page.getByRole("heading", { name });
  const nav = (label) => page.locator("header").getByRole("link", { name: label });

  await page.setContent(`
    <html>
      <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#1E2126,#2a3140);color:#fff;font-family:Segoe UI,sans-serif;">
        <div style="text-align:center;max-width:720px;padding:40px;">
          <p style="letter-spacing:.22em;text-transform:uppercase;color:#f5b7b1;font-size:13px;">NOV Campus</p>
          <h1 style="font-size:48px;margin:12px 0 8px;">Recorrido de la plataforma</h1>
          <p style="opacity:.8;font-size:20px;">Participantes, capacitadores y progreso.</p>
        </div>
      </body>
    </html>
  `);
  await ready(page);
  await section("Inicio");
  await speak("intro", await by((p) => p.locator("h1")));

  await arrive(page, `${base}/capacitacion`, heading(/Campus de capacitaci/i));
  await section("Portal");
  await speak("portal.participants", await by((p) => p.getByRole("link", { name: /Participantes/i })));
  await speak("portal.trainers", await by((p) => p.getByRole("link", { name: /Capacitadores/i })));
  await speak("portal.progress", await by((p) => p.getByRole("link", { name: /Progreso/i })));

  await click(await by((p) => p.getByRole("link", { name: /Progreso/i })));
  await waitShown(page.locator('input[type="email"]'));
  await ready(page);
  await section("Capacitadores - Ingreso");
  await speak("admin.login", await by((p) => p.locator("form")));
  await type(page.locator('input[type="email"]').first(), env.adminEmail);
  await type(page.locator('input[type="password"]').first(), env.adminPassword);
  await spotlight(page, await by((p) => p.getByRole("button", { name: /Ingresar/i })));
  await loginAdmin(page, env, "/capacitacion/admin/progreso", heading(/Cumplimiento del campus/i));

  await section("Capacitadores - Progreso");
  await speak("progreso.kpis", await by((p) => heading(/Cumplimiento del campus/i)));
  await speak("progreso.filtros", await by((p) => p.getByPlaceholder(/Buscar por alumno/i)));

  await click(await by((p) => nav("Panel")));
  await waitShown(heading(/Panel de capacitadores/i));
  await ready(page);
  await section("Capacitadores - Panel");
  await speak("admin.panel", await by((p) => p.locator("header")));
  await speak("admin.stats", await by((p) => p.getByText("Resumen general")));
  await speak("admin.rooms.home", await by((p) => p.getByRole("heading", { name: /Salas de capacitaci/i })));

  await click(await by((p) => nav("Salas")));
  await waitShown(heading(/^Salas$/i));
  await ready(page);
  await section("Capacitadores - Salas");
  await speak("salas.intro", await by((p) => heading(/^Salas$/i)));
  await speak("salas.form", await by((p) => p.locator("form")));
  await type(await by((p) => labeledControl(p, /^Nombre$/)), "Sala de demostracion");
  await type(await by((p) => labeledControl(p, /slug/i)), "sala-demo");
  await spotlight(page, await by((p) => p.getByRole("button", { name: /Crear sala|Guardar/i })));
  await speak("salas.list", await by((p) => heading(/Salas existentes/i)));

  await click(await by((p) => nav("Capacitaciones")));
  await waitShown(heading(/^Capacitaciones$/i));
  await ready(page);
  await section("Capacitadores - Capacitaciones");
  await speak("cursos.list", await by((p) => p.getByRole("link", { name: /Nueva capacitaci/i })));

  await click(await by((p) => p.getByRole("link", { name: /Nueva capacitaci/i })));
  await waitShown(heading(/Datos generales/i));
  await ready(page);
  await speak("cursos.nueva", await by((p) => heading(/Datos generales/i)));
  await type(await by((p) => labeledControl(p, /T.tulo|Titulo/)), "Curso de demostracion");
  await speak("cursos.reglas", await by((p) => labeledControl(p, /^Sala$/)));
  await speak("cursos.alcance", await by((p) => labeledControl(p, /Sector/)));
  await speak("cursos.publicar", await by((p) => p.getByText(/Publicar capacitaci/i)));
  await speak("cursos.material", await by((p) => heading(/Material did/i)));
  await speak("cursos.quiz", await by((p) => heading(/Evaluaci/i)));
  await speak("cursos.guardar", await by((p) => p.getByRole("button", { name: /Crear capacitaci/i })));

  await click(await by((p) => nav("Matriz")));
  await waitShown(heading(/Celdas de capacitaci/i));
  await ready(page);
  await section("Capacitadores - Matriz");
  await speak("matriz.intro", await by((p) => heading(/Celdas de capacitaci/i)));
  await speak("matriz.form", await by((p) => heading(/Agregar tema a una celda/i)));
  await speak("matriz.celdas", await by((p) => p.getByText(/Celdas publicadas/i)));

  await click(await by((p) => nav(/Alumnos y DNIs/i)));
  await waitShown(heading(/Alumnos y DNIs/i));
  await ready(page);
  await section("Capacitadores - Alumnos");
  await speak("alumnos.alta", await by((p) => heading(/Habilitar nuevo DNI/i)));
  await type(await by((p) => p.getByPlaceholder(/mero de DNI|Numero de DNI/)), "39999888");
  await spotlight(page, await by((p) => p.getByRole("button", { name: "Habilitar DNI" })));
  await speak("alumnos.csv", await by((p) => p.getByText(/Importar CSV/i)));
  await page.getByPlaceholder(/mero de DNI|Numero de DNI/).first().fill("");

  await click(await by((p) => nav("Alertas")));
  await waitShown(heading(/alertas/i));
  await ready(page);
  await section("Capacitadores - Alertas");
  await speak("alertas.intro", await by((p) => heading(/alertas/i)));
  await click(await by((p) => p.getByRole("button", { name: "Nueva alerta" })));
  await speak("alertas.form", await by((p) => p.getByPlaceholder(/Curso de altura/i)));
  await type(await by((p) => p.getByPlaceholder(/Curso de altura/i)), "Aviso de demostracion");
  await click(await by((p) => p.getByRole("button", { name: "Cancelar" })));

  await speak("campus.salida", await by((p) => p.locator("header").getByRole("button", { name: /Salir/i })));
  await page.request.post(`${env.base}/api/auth/admin/logout`);
  await arrive(page, `${base}/capacitacion`, heading(/Campus de capacitaci/i));

  await click(await by((p) => p.getByRole("link", { name: /Participantes/i })));
  await waitShown(page.getByPlaceholder(/Ej:/).or(page.locator("form")));
  await ready(page);
  await section("Participantes - Ingreso");
  await speak("campus.login", await by((p) => p.locator("form")));
  await type(await by((p) => p.getByPlaceholder(/Ej:/)), env.studentDni);
  await spotlight(page, await by((p) => p.getByRole("button", { name: /Ingresar al campus/i })));

  const campusReady = heading(/Hola/i);
  await loginStudent(page, env, campusReady);
  await waitShown(page.getByRole("tablist", { name: /Estado de tus capacitaciones/i }), 15000);

  await section("Participantes - Campus");
  await speak("campus.terna", await by((p) => heading(/Hola/i)));
  await spotlight(page, await by((p) => p.getByText("Sector", { exact: true })));
  await spotlight(page, await by((p) => p.getByText("Puesto", { exact: true })));
  await spotlight(page, await by((p) => p.getByText("Tarea", { exact: true })));
  await speak("campus.tablero", await by((p) => p.getByRole("tab", { name: /Asignadas/i })));
  await click(await by((p) => p.getByRole("tab", { name: /Asignadas/i })));
  await speak("campus.asignadas", await by((p) => p.getByRole("tab", { name: /Asignadas/i })));
  await click(await by((p) => p.getByRole("tab", { name: /Vigentes/i })));
  await speak("campus.vigentes", await by((p) => p.getByRole("tab", { name: /Vigentes/i })));

  const verLink = await firstVisible(page.getByRole("link", { name: /^Ver$/i }), 4000);
  if (verLink) {
    await click(verLink);
    const certMark = page.getByText(/Felicitaciones|certificado|aprobaste/i);
    await waitShown(certMark, 15000);
    await ready(page);
    await speak("campus.cert", await by((p) => p.getByText(/Felicitaciones|certificado|aprobaste/i)));
  }

  const hist = await by((p) => p.getByRole("link", { name: /historial de certificados|Mis certificados/i }));
  if (hist) await click(hist);
  else await page.goto(`${base}/capacitacion/campus/certificados`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitShown(heading(/Mis certificados/i));
  await ready(page);
  await section("Participantes - Certificados");
  await speak("campus.historial", await by((p) => heading(/Mis certificados/i)));

  await page.setContent(`
    <html>
      <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#1E2126,#2a3140);color:#fff;font-family:Segoe UI,sans-serif;">
        <div style="text-align:center;max-width:720px;padding:40px;">
          <p style="letter-spacing:.22em;text-transform:uppercase;color:#f5b7b1;font-size:13px;">NOV Campus</p>
          <h1 style="font-size:44px;margin:12px 0 8px;">Listo para operar</h1>
          <p style="opacity:.8;font-size:20px;">Publicar. Asignar. Cursar. Certificar.</p>
        </div>
      </body>
    </html>
  `);
  await ready(page);
  await section("Cierre");
  await speak("cierre", await by((p) => p.locator("h1")));
}

function generateTts(clipsPath) {
  const result = spawnSync(
    "python",
    [path.join(HERE, "audio.py"), "generate", clipsPath, CACHE, ffmpegPath],
    { cwd: ROOT, stdio: "inherit" }
  );
  if (result.status !== 0) throw new Error("TTS generation failed");
}

function mixAudio(timelinePath, narrationWav) {
  const result = spawnSync(
    "python",
    [path.join(HERE, "audio.py"), "mix", timelinePath, CACHE, narrationWav],
    { cwd: ROOT, stdio: "inherit" }
  );
  if (result.status !== 0) throw new Error("audio mix failed");
}

function mux(videoPath, audioPath) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const result = spawnSync(
    ffmpegPath,
    [
      "-y",
      "-i",
      videoPath,
      "-i",
      audioPath,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-shortest",
      "-movflags",
      "+faststart",
      VIDEO_OUT,
    ],
    { stdio: "inherit" }
  );
  if (result.status !== 0) throw new Error("ffmpeg mux failed");
}

function clearTourCache() {
  fs.mkdirSync(CACHE, { recursive: true });
  for (const name of fs.readdirSync(CACHE)) {
    if (/\.(wav|mp3|webm|json)$/i.test(name)) {
      fs.unlinkSync(path.join(CACHE, name));
    }
  }
}

async function main() {
  loadEnv();
  clearTourCache();
  const clipsPath = path.join(CACHE, "clips.json");
  const exported = spawnSync("python", [path.join(HERE, "audio.py"), "export", clipsPath], {
    cwd: HERE,
    stdio: "inherit",
  });
  if (exported.status !== 0) throw new Error("clip export failed");
  CLIPS = JSON.parse(fs.readFileSync(clipsPath, "utf8"));

  console.log("Generando voz...");
  generateTts(clipsPath);
  const durations = JSON.parse(fs.readFileSync(path.join(CACHE, "durations.json"), "utf8"));

  const env = {
    base: process.env.DEMO_BASE_URL || "http://localhost:3000",
    adminEmail: process.env.ADMIN_EMAIL || "admin@nov.com",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    studentDni: process.env.DEMO_STUDENT_DNI || "30111222",
    accessKey: process.env.CAMPUS_ACCESS_KEY || "nov2026",
  };
  if (!env.adminPassword) throw new Error("Falta ADMIN_PASSWORD en .env");

  const timeline = { events: [], videoMs: 0 };
  const startedAt = { value: 0 };

  console.log("Grabando recorrido en el navegador...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: CACHE, size: VIEWPORT },
    locale: "es-AR",
  });
  await context.addInitScript(installTour);
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  startedAt.value = Date.now();
  try {
    await runTour(page, durations, timeline, startedAt, env);
  } catch (err) {
    console.warn("Tour incompleto:", err.message);
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();
    const videoPath = video ? await video.path() : "";
    timeline.videoMs = probeDurationMs(videoPath);
    const timelinePath = path.join(CACHE, "timeline.json");
    fs.writeFileSync(timelinePath, JSON.stringify({ ...timeline, videoPath }, null, 2), "utf8");
    const narrationWav = path.join(CACHE, "narration.wav");
    console.log("Mezclando narracion...");
    mixAudio(timelinePath, narrationWav);
    console.log("Exportando MP4...");
    mux(videoPath, narrationWav);
    console.log(`Video listo: ${VIDEO_OUT}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
