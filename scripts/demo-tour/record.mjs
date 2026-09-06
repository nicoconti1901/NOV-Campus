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
  const STYLE_ID = "tour-style";
  const ROOT_ID = "tour-root";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #tour-root { all: initial; pointer-events: none !important; }
      #tour-root * { box-sizing: border-box; font-family: Inter, Segoe UI, system-ui, sans-serif; }
      #tour-spot {
        position: fixed; pointer-events: none !important; z-index: 2147483645;
        border: 3px solid #ED3229; border-radius: 16px;
        box-shadow: 0 0 0 9999px rgba(15,23,42,.48), 0 0 28px rgba(237,50,41,.55);
        transition: top .12s ease, left .12s ease, width .12s ease, height .12s ease, opacity .12s ease;
        opacity: 0;
      }
      #tour-spot.tour-spot-locked {
        transition: none;
      }
      #tour-cursor {
        position: fixed; width: 18px; height: 18px; margin-left: -9px; margin-top: -9px;
        border: 2px solid #fff; background: #ED3229; border-radius: 999px;
        box-shadow: 0 0 0 4px rgba(237,50,41,.28); pointer-events: none; z-index: 2147483647;
        transition: transform .08s linear;
      }
      #tour-caption {
        position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);
        width: min(980px, calc(100vw - 40px)); pointer-events: none; z-index: 2147483646;
        background: rgba(30,33,38,.94); color: #fff; border-radius: 16px; padding: 14px 20px 14px 18px;
        border-left: 5px solid #ED3229; box-shadow: 0 18px 40px rgba(15,23,42,.35);
        font-size: 17px; line-height: 1.4; letter-spacing: .01em;
      }
      #tour-section {
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
      <div id="tour-spot"></div>
      <div id="tour-cursor"></div>
      <div id="tour-section"></div>
      <div id="tour-caption"></div>
    `;
    document.documentElement.appendChild(root);
    document.addEventListener(
      "mousemove",
      (event) => {
        const cursor = document.getElementById("tour-cursor");
        if (!cursor) return;
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      },
      true
    );
  }
  window.__tour = {
    _followTimer: 0,
    _followEl: null,
    setSection(text) {
      const el = document.getElementById("tour-section");
      if (el) el.textContent = text || "";
    },
    setCaption(text) {
      const el = document.getElementById("tour-caption");
      if (el) el.textContent = text || "";
    },
    spotlight(box) {
      const el = document.getElementById("tour-spot");
      if (!el || !box) return;
      const pad = 10;
      el.style.left = `${Math.max(6, box.x - pad)}px`;
      el.style.top = `${Math.max(6, box.y - pad)}px`;
      el.style.width = `${Math.max(24, box.width + pad * 2)}px`;
      el.style.height = `${Math.max(24, box.height + pad * 2)}px`;
      el.style.opacity = "1";
    },
    clearSpot() {
      this.unlock();
      const el = document.getElementById("tour-spot");
      if (el) el.style.opacity = "0";
    },
    lock(el) {
      this.unlock();
      if (!el) return;
      this._followEl = el;
      const spot = document.getElementById("tour-spot");
      if (spot) spot.classList.add("tour-spot-locked");
      const tick = () => {
        if (!this._followEl) return;
        const rect = this._followEl.getBoundingClientRect();
        if (rect.width > 2 && rect.height > 2) {
          this.spotlight({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          });
        }
        this._followTimer = window.setTimeout(tick, 80);
      };
      tick();
    },
    unlock() {
      if (this._followTimer) {
        window.clearTimeout(this._followTimer);
        this._followTimer = 0;
      }
      this._followEl = null;
      const spot = document.getElementById("tour-spot");
      if (spot) spot.classList.remove("tour-spot-locked");
    },
  };
}

async function ready(page) {
  await page.evaluate(installTour).catch(() => undefined);
}

async function firstVisible(locator, timeout = 4000) {
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
    await page.evaluate(() => window.__tour?.clearSpot?.());
    return;
  }
  try {
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(140);
    const box = await locator.boundingBox();
    if (!box) {
      await page.evaluate(() => window.__tour?.clearSpot?.());
      return;
    }
    const x = box.x + Math.min(box.width / 2, 120);
    const y = box.y + Math.min(box.height / 2, 28);
    await page.mouse.move(x, y, { steps: 3 });
    // evaluate sobre el locator (más fiable que pasar ElementHandle).
    await locator.evaluate((el) => window.__tour?.lock?.(el));
  } catch {
    await page.evaluate(() => window.__tour?.clearSpot?.());
  }
}

/** Encuadra varios nodos en un solo foco estático (sin scroll durante la voz). */
async function spotlightGroup(page, locators) {
  const valid = locators.filter(Boolean);
  // 1) Traer todo a vista
  for (const locator of valid) {
    try {
      await locator.scrollIntoViewIfNeeded();
    } catch {
      /* skip */
    }
  }
  await page.waitForTimeout(120);
  // 2) Medir DESPUÉS del scroll (si se mide mientras se scrollea, el grupo queda mal).
  const boxes = [];
  for (const locator of valid) {
    try {
      const box = await locator.boundingBox();
      if (box && box.width > 2 && box.height > 2) boxes.push(box);
    } catch {
      /* skip */
    }
  }
  if (!boxes.length) {
    await page.evaluate(() => window.__tour?.clearSpot?.());
    return;
  }
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const right = Math.max(...boxes.map((b) => b.x + b.width));
  const bottom = Math.max(...boxes.map((b) => b.y + b.height));
  const rect = { x, y, width: right - x, height: bottom - y };
  await page.mouse.move(x + Math.min(rect.width / 2, 120), y + Math.min(rect.height / 2, 28), {
    steps: 3,
  });
  await page.evaluate((box) => {
    const api = window.__tour;
    if (!api) return;
    api.unlock?.();
    const spot = document.getElementById("tour-spot");
    // Sin transición: el foco debe aparecer ya en el rectángulo correcto (evita frames a medio camino).
    if (spot) spot.classList.add("tour-spot-locked");
    api.spotlight?.(box);
  }, rect);
}

async function spotlightAncestor(page, locator, levels = 2) {
  if (!locator) {
    await page.evaluate(() => window.__tour?.clearSpot?.());
    return;
  }
  try {
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    await locator.evaluate((el, n) => {
      let node = el;
      for (let i = 0; i < n && node.parentElement; i += 1) node = node.parentElement;
      window.__tour?.lock?.(node);
    }, levels);
  } catch {
    await spotlight(page, locator);
  }
}

async function focusHold(page, locator, ms, mode = "single") {
  if (mode === "group" && Array.isArray(locator)) {
    await spotlightGroup(page, locator);
  } else if (mode === "ancestor") {
    await spotlightAncestor(page, locator, 3);
  } else if (locator) {
    await spotlight(page, locator);
  }
  const step = 200;
  let left = ms;
  while (left > 0) {
    const slice = Math.min(step, left);
    await page.waitForTimeout(slice);
    left -= slice;
  }
}

function pathnameOf(page) {
  return new URL(page.url()).pathname.replace(/\/$/, "") || "/";
}

async function waitShown(locator, timeout = 20000) {
  await locator.first().waitFor({ state: "visible", timeout });
}

async function scrollTop(page) {
  await page.evaluate(() => {
    const html = document.scrollingElement || document.documentElement;
    html.scrollTo({ top: 0, behavior: "instant" });
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "instant" });
  });
}

async function revealPage(page, durationMs) {
  await page.evaluate(async (duration) => {
    const nodes = [document.scrollingElement, document.documentElement, document.querySelector("main")].filter(Boolean);
    let el = document.scrollingElement || document.documentElement;
    let max = 0;
    for (const node of nodes) {
      const room = node.scrollHeight - node.clientHeight;
      if (room > max) {
        max = room;
        el = node;
      }
    }
    if (max <= 48) return;
    // Scroll suave y corto: solo un vistazo, sin comerse toda la narración.
    const travel = Math.min(max, Math.max(160, el.clientHeight * 0.7));
    const steps = Math.max(6, Math.floor(duration / 50));
    const started = performance.now();
    for (let i = 1; i <= steps; i++) {
      el.scrollTop = (travel * i) / steps;
      const wait = started + (duration * i) / steps - performance.now();
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }, Math.max(280, durationMs));
}

async function gotoSafe(page, href) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await page.goto(href, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => undefined);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function arrive(page, href, locator) {
  const target = new URL(href).pathname.replace(/\/$/, "");
  if (pathnameOf(page) !== target) {
    await gotoSafe(page, href);
  }
  if (locator) await waitShown(locator);
  await ready(page);
}

async function clickOrGo(page, locator, href, readyLocator) {
  await scrollTop(page);
  await page.mouse.move(40, 40);
  await page.evaluate(() => window.stop());
  await gotoSafe(page, href);
  if (readyLocator) await waitShown(readyLocator, 25000);
  await ready(page);
  if (locator) await spotlight(page, locator);
}

async function authThenGo(page, login, destPath, readyLocator) {
  await login();
  await gotoSafe(page, destPath);
  await waitShown(readyLocator, 20000);
  if (pathnameOf(page).includes("/login")) {
    await login();
    await gotoSafe(page, destPath);
    await waitShown(readyLocator, 20000);
  }
  await ready(page);
}

function createHelpers(page, durations, timeline, startedAt) {
  return {
    async section(text) {
      await page.evaluate((value) => window.__tour?.setSection?.(value), text);
    },
    async speak(id, locator, opts = {}) {
      const clip = CLIPS.find((item) => item.id === id);
      if (!clip) throw new Error(`missing clip ${id}`);
      const waitMs = Math.max(800, durations[id] || 4000);
      const mode = opts.mode || "single";
      const settleMs = 550; // debe coincidir con PRE_ROLL_MS en audio.py

      // 1) Primero el foco visual (nunca caption con el spotlight anterior).
      if (mode === "group" && Array.isArray(locator)) {
        for (const loc of locator) {
          if (loc) await loc.waitFor({ state: "visible", timeout: 12000 }).catch(() => undefined);
        }
        await spotlightGroup(page, locator);
      } else if (mode === "ancestor") {
        if (locator) await locator.waitFor({ state: "visible", timeout: 12000 }).catch(() => undefined);
        await spotlightAncestor(page, locator, opts.levels ?? 3);
      } else if (locator) {
        await locator.waitFor({ state: "visible", timeout: 12000 }).catch(() => undefined);
        await spotlight(page, locator);
      } else {
        await page.evaluate(() => window.__tour?.clearSpot?.());
      }

      // 2) Caption recién cuando el foco ya está pintado.
      await page.evaluate((value) => window.__tour?.setCaption?.(value), clip.text);
      await page.waitForTimeout(80);
      timeline.events.push({ id, startMs: Date.now() - startedAt.value });
      await page.waitForTimeout(settleMs);
      // Evidencia de foco para QA visual post-grabación.
      await page
        .screenshot({
          path: path.join(CACHE, "focus", `${id.replace(/\./g, "_")}.jpg`),
          type: "jpeg",
          quality: 72,
        })
        .catch(() => undefined);

      if (typeof opts.during === "function") {
        const started = Date.now();
        await Promise.all([
          page.waitForTimeout(waitMs),
          (async () => {
            try {
              await opts.during({
                page,
                waitMs,
                elapsed: () => Date.now() - started,
                focus: async (loc) => {
                  if (loc) await spotlight(page, loc);
                },
                sleep: (ms) => page.waitForTimeout(ms),
              });
            } catch {
              /* ignore */
            }
          })(),
        ]);
      } else {
        await page.waitForTimeout(waitMs);
      }
      // No limpiar el foco al terminar: el siguiente speak lo reemplaza.
      // Así un leve desfase de reloj del WebM no muestra pantalla sin spotlight.
    },
    async click(locator) {
      if (!locator) return;
      await spotlight(page, locator);
      try {
        await locator.click({ force: true, timeout: 3000 });
      } catch {}
      await ready(page);
    },
    async type(locator, text) {
      if (!locator) return;
      try {
        await locator.click({ force: true, timeout: 2000 });
        await locator.fill(text, { timeout: 2000 });
      } catch {}
    },
  };
}

async function runTour(page, durations, timeline, startedAt, env) {
  const { speak, section, click, type } = createHelpers(page, durations, timeline, startedAt);
  const base = env.base;
  const by = (fn) => firstVisible(fn(page));
  const heading = (name) => page.getByRole("heading", { name });
  const navHref = (path) => page.locator("header").locator(`a[href="${path}"]`);
  const tour = (id) => page.locator(`[data-tour="${id}"]`).first();
  const loginAdmin = () =>
    page.request.post(`${env.base}/api/auth/admin/login`, {
      data: { email: env.adminEmail, password: env.adminPassword },
    });
  const loginStudent = () =>
    page.request.post(`${env.base}/api/auth/student/login`, {
      data: { dni: env.studentDni, accessKey: env.accessKey },
    });

  await page.setContent(`
    <html>
      <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#1E2126,#2a3140);color:#fff;font-family:Segoe UI,sans-serif;">
        <div style="text-align:center;max-width:760px;padding:40px;">
          <p style="letter-spacing:.22em;text-transform:uppercase;color:#f5b7b1;font-size:13px;">Campus de capacitaci&oacute;n</p>
          <h1 style="font-size:44px;margin:12px 0 8px;">Matriz de competencias</h1>
          <p style="opacity:.8;font-size:20px;">Cumplimiento por sector, puesto y tarea.</p>
        </div>
      </body>
    </html>
  `);
  await ready(page);
  await section("Inicio");
  await speak("intro", await by((p) => p.locator("h1")));

  await arrive(page, `${base}/capacitacion`, heading(/Campus de capacitaci/i));
  await section("Portal");
  await speak("portal.participants", tour("portal-participants"));
  await speak("portal.trainers", tour("portal-trainers"));
  await speak("portal.progress", tour("portal-progress"));

  await clickOrGo(
    page,
    await by((p) => p.getByRole("link", { name: /Participantes/i })),
    `${base}/capacitacion/${env.accessKey}`,
    page.getByPlaceholder(/Ej:/).or(page.locator("form"))
  );
  await section("Participantes");
  await type(await by((p) => p.getByPlaceholder(/Ej:/)), env.studentDni);
  await speak("campus.login", await by((p) => p.locator("form")));
  await authThenGo(page, loginStudent, `${base}/capacitacion/campus`, heading(/Hola/i));
  await waitShown(page.getByRole("tablist", { name: /Estado de tus capacitaciones/i }), 12000);

  await section("Participantes");
  await scrollTop(page);
  await speak("campus.terna", tour("campus-profile"));
  await speak("campus.estados", tour("campus-status-tabs"));

  await click(await by((p) => p.getByRole("tab", { name: /Asignadas/i })));
  await speak("campus.asignadas", await by((p) => p.getByRole("tab", { name: /Asignadas/i })));

  await click(await by((p) => p.getByRole("tab", { name: /Vigentes/i })));
  await speak("campus.vigentes", await by((p) => p.getByRole("tab", { name: /Vigentes/i })));

  const verLink = await firstVisible(page.getByRole("link", { name: /^Ver$/i }), 3000);
  if (verLink) {
    await click(verLink);
    await waitShown(page.getByText(/Felicitaciones|certificado|aprobaste/i), 12000);
    await ready(page);
    await speak(
      "campus.cert",
      await by((p) =>
        p.locator("section, article, div").filter({ hasText: /Felicitaciones|certificado|aprobaste/i }).first()
      )
    );
  }

  await arrive(page, `${base}/capacitacion/campus/certificados`, heading(/Mis certificados/i));
  await section("Participantes");
  await speak("campus.historial", await by((p) => heading(/Mis certificados/i)));

  await speak("campus.salida", await by((p) => p.locator("header").getByRole("link", { name: /Inicio/i })));
  await page.request.post(`${env.base}/api/auth/student/logout`);
  await arrive(page, `${base}/capacitacion`, heading(/Campus de capacitaci/i));

  await clickOrGo(
    page,
    await by((p) => p.getByRole("link", { name: /Capacitadores/i })),
    `${base}/capacitacion/admin/login`,
    page.locator('input[type="email"]')
  );
  await section("Capacitadores");
  await type(page.locator('input[type="email"]').first(), env.adminEmail);
  await type(page.locator('input[type="password"]').first(), env.adminPassword);
  await speak("admin.login", await by((p) => p.locator("form")));
  await authThenGo(page, loginAdmin, `${base}/capacitacion/admin`, heading(/Panel de capacitadores/i));

  await section("Capacitadores");
  await scrollTop(page);
  await speak("admin.panel", await by((p) => p.locator("header")));
  await speak("admin.stats", tour("admin-stats"));
  await speak(
    "admin.rooms.home",
    await by((p) => p.getByRole("heading", { name: /Salas de capacitaci/i })),
    { mode: "ancestor", levels: 3 }
  );

  await clickOrGo(
    page,
    await by((p) => navHref("/capacitacion/admin/salas")),
    `${base}/capacitacion/admin/salas`,
    heading(/Salas existentes/i)
  );
  await speak("salas.intro", await by((p) => heading(/^Salas$/i)));
  await speak("salas.form", await by((p) => p.locator("form").first()));
  await speak("salas.list", await by((p) => heading(/Salas existentes/i)));

  await clickOrGo(
    page,
    await by((p) => navHref("/capacitacion/admin/capacitaciones")),
    `${base}/capacitacion/admin/capacitaciones`,
    heading(/Capacitaciones/i)
  );
  await speak("cursos.list", await by((p) => p.getByRole("link", { name: /Nueva capacitaci/i })));

  await clickOrGo(
    page,
    await by((p) => p.getByRole("link", { name: /Nueva capacitaci/i })),
    `${base}/capacitacion/admin/capacitaciones/nueva`,
    heading(/Datos generales/i)
  );
  await speak("cursos.nueva", tour("training-basics"));
  await speak("cursos.reglas", tour("training-rules-block"));
  await speak("cursos.alcance", tour("training-scope-block"));
  await speak("cursos.publicar", tour("training-publish"));
  await speak("cursos.material", await by((p) => heading(/Material did/i)), { mode: "ancestor", levels: 2 });
  await speak("cursos.quiz", await by((p) => heading(/Evaluaci/i)), { mode: "ancestor", levels: 2 });
  await speak("cursos.guardar", await by((p) => p.getByRole("button", { name: /Crear capacitaci/i })));

  await clickOrGo(
    page,
    await by((p) => navHref("/capacitacion/admin/matriz")),
    `${base}/capacitacion/admin/matriz`,
    heading(/Celdas de capacitaci/i)
  );
  await speak("matriz.intro", await by((p) => heading(/Celdas de capacitaci/i)));
  await speak("matriz.form", tour("matriz-form"));
  await speak("matriz.celdas", await by((p) => p.getByText(/Celdas publicadas/i)));

  await clickOrGo(
    page,
    await by((p) => navHref("/capacitacion/admin/alumnos")),
    `${base}/capacitacion/admin/alumnos`,
    heading(/Alumnos y DNIs/i)
  );
  await speak("alumnos.alta", await by((p) => heading(/Habilitar nuevo DNI/i)));
  await speak("alumnos.csv", await by((p) => p.getByText(/Importar CSV/i)));

  await clickOrGo(
    page,
    await by((p) => navHref("/capacitacion/admin/alertas")),
    `${base}/capacitacion/admin/alertas`,
    heading(/alertas/i)
  );
  await speak("alertas.intro", await by((p) => heading(/alertas/i)));
  await click(await by((p) => p.getByRole("button", { name: "Nueva alerta" })));
  await speak(
    "alertas.form",
    await by((p) => p.locator("form").filter({ has: p.getByPlaceholder(/Curso de altura/i) }).first())
  );
  await click(await by((p) => p.getByRole("button", { name: "Cancelar" })));

  await clickOrGo(page, await by((p) => navHref("/capacitacion")), `${base}/capacitacion`, heading(/Campus de capacitaci/i));
  await section("Progreso");
  await speak("progreso.entrada", tour("portal-progress"));
  await clickOrGo(
    page,
    tour("portal-progress"),
    `${base}/capacitacion/admin/progreso`,
    heading(/Cumplimiento del campus/i)
  );
  await scrollTop(page);
  await speak("progreso.kpis", tour("progress-kpis"));
  await speak("progreso.filtros", await by((p) => p.getByPlaceholder(/Buscar por alumno/i)), {
    mode: "ancestor",
    levels: 3,
  });

  await page.setContent(`
    <html>
      <body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
        background:linear-gradient(135deg,#1E2126,#2a3140);color:#fff;font-family:Segoe UI,sans-serif;">
        <div style="text-align:center;max-width:720px;padding:40px;">
          <p style="letter-spacing:.22em;text-transform:uppercase;color:#f5b7b1;font-size:13px;">Matriz de competencias</p>
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

function assembleFinal(timelinePath) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const result = spawnSync(
    "python",
    [path.join(HERE, "audio.py"), "assemble", timelinePath, CACHE, ffmpegPath, VIDEO_OUT],
    { cwd: ROOT, stdio: "inherit" }
  );
  if (result.status !== 0) throw new Error("assemble/QA failed");
}

function clearVideoCache() {
  fs.mkdirSync(CACHE, { recursive: true });
  fs.mkdirSync(path.join(CACHE, "focus"), { recursive: true });
  for (const name of fs.readdirSync(CACHE)) {
    if (
      /\.(webm|mp4)$/i.test(name) ||
      name === "timeline.json" ||
      name === "narration.wav" ||
      name === "qa-report.json" ||
      name === "cut.mp4"
    ) {
      fs.unlinkSync(path.join(CACHE, name));
    }
  }
  const focusDir = path.join(CACHE, "focus");
  if (fs.existsSync(focusDir)) {
    for (const name of fs.readdirSync(focusDir)) {
      fs.unlinkSync(path.join(focusDir, name));
    }
  }
}

async function warmServer(env) {
  console.log("Precalentando rutas (evita spinners de compile en la grabación)...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, locale: "es-AR" });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  try {
    await page.request.post(`${env.base}/api/auth/admin/login`, {
      data: { email: env.adminEmail, password: env.adminPassword },
    });
    await page.request.post(`${env.base}/api/auth/student/login`, {
      data: { dni: env.studentDni, accessKey: env.accessKey },
    });
    const routes = [
      "/capacitacion",
      `/capacitacion/${env.accessKey}`,
      "/capacitacion/campus",
      "/capacitacion/campus/certificados",
      "/capacitacion/admin/login",
      "/capacitacion/admin",
      "/capacitacion/admin/salas",
      "/capacitacion/admin/capacitaciones",
      "/capacitacion/admin/capacitaciones/nueva",
      "/capacitacion/admin/matriz",
      "/capacitacion/admin/alumnos",
      "/capacitacion/admin/alertas",
      "/capacitacion/admin/progreso",
    ];
    for (const route of routes) {
      await page.goto(`${env.base}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => undefined);
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  loadEnv();
  clearVideoCache();
  const clipsPath = path.join(CACHE, "clips.json");
  const exported = spawnSync("python", [path.join(HERE, "audio.py"), "export", clipsPath], {
    cwd: HERE,
    stdio: "inherit",
  });
  if (exported.status !== 0) throw new Error("clip export failed");
  CLIPS = JSON.parse(fs.readFileSync(clipsPath, "utf8"));
  const namedNov = CLIPS.filter((clip) => /\bNOV\b/i.test(clip.text));
  if (namedNov.length) throw new Error(`Narracion nombra NOV: ${namedNov.map((c) => c.id).join(", ")}`);

  const clipsHashPath = path.join(CACHE, "clips.hash");
  const clipsHash = String(CLIPS.map((c) => `${c.id}:${c.text}`).join("|").length);
  const durationsPath = path.join(CACHE, "durations.json");
  const hashMatches = fs.existsSync(clipsHashPath) && fs.readFileSync(clipsHashPath, "utf8") === clipsHash;
  if (!fs.existsSync(durationsPath) || !hashMatches) {
    console.log("Generando voz...");
    generateTts(clipsPath);
    fs.writeFileSync(clipsHashPath, clipsHash, "utf8");
  } else {
    console.log("Reusando voz generada");
  }
  const durations = JSON.parse(fs.readFileSync(path.join(CACHE, "durations.json"), "utf8"));

  const env = {
    base: process.env.DEMO_BASE_URL || "http://localhost:3000",
    adminEmail: process.env.ADMIN_EMAIL || "admin@nov.com",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    studentDni: process.env.DEMO_STUDENT_DNI || "30111222",
    accessKey: process.env.CAMPUS_ACCESS_KEY || "campus-dev-2026",
  };
  if (!env.adminPassword) throw new Error("Falta ADMIN_PASSWORD en .env");

  // Comprueba que el server responda antes de grabar.
  const health = spawnSync("node", ["-e", `fetch("${env.base}/capacitacion").then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))`], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (health.status !== 0) {
    throw new Error(`El server no responde en ${env.base}. Ejecutá npm run dev antes de grabar.`);
  }

  await warmServer(env);

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
  page.setDefaultTimeout(30000);
  // Pequeño settle para que el encoder de Playwright arranque antes del primer mark.
  await page.setContent(`<html><body style="margin:0;background:#1E2126"></body></html>`);
  await page.waitForTimeout(400);
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
    if (!timeline.events.some((event) => event.id === "cierre")) {
      console.error("Tour incompleto: no se actualiza el MP4 final.");
      return;
    }
    console.log("Recortando tiempos muertos y sincronizando audio...");
    assembleFinal(timelinePath);
    console.log(`Video listo: ${VIDEO_OUT}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
