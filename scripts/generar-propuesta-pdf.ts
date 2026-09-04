/**
 * Propuesta comercial NOV — DEVCEN Connected Systems
 * Uso: npx tsx scripts/generar-propuesta-pdf.ts
 */
import { jsPDF } from "jspdf";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT = path.join(
  process.cwd(),
  "docs",
  "Propuesta-Plataforma-Corporativa-Capacitacion-ARS.pdf"
);
const OUT_ALT = path.join(
  process.cwd(),
  "docs",
  "Propuesta-Plataforma-Corporativa-Capacitacion.pdf"
);
const LOGO = path.join(process.cwd(), "public", "images", "logoDEVCEN1.png");

/** Paleta DEVCEN: carbón + naranja del logo */
const C = {
  ink: [18, 18, 20] as const,
  inkSoft: [42, 42, 46] as const,
  orange: [255, 140, 0] as const,
  orangeDeep: [224, 122, 47] as const,
  gray: [88, 88, 94] as const,
  grayLight: [145, 145, 150] as const,
  line: [220, 220, 222] as const,
  bgSoft: [246, 246, 247] as const,
  white: [255, 255, 255] as const,
};

const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CLIENT = "NOV";

function rgb(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}
function fill(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function stroke(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

async function loadLogo(): Promise<string | null> {
  if (!fs.existsSync(LOGO)) {
    console.warn("Logo no encontrado:", LOGO);
    return null;
  }
  const png = await sharp(LOGO)
    .resize({ width: 900, withoutEnlargement: true })
    .png()
    .toBuffer();
  return png.toString("base64");
}

class ProposalPdf {
  doc = new jsPDF({ unit: "mm", format: "a4" });
  y = MARGIN;
  page = 1;
  logo: string | null;

  constructor(logo: string | null) {
    this.logo = logo;
  }

  private drawHeader() {
    fill(this.doc, C.ink);
    this.doc.rect(0, 0, PAGE_W, 16, "F");
    fill(this.doc, C.orange);
    this.doc.rect(0, 16, PAGE_W, 1.4, "F");

    if (this.logo) {
      this.doc.addImage(`data:image/png;base64,${this.logo}`, "PNG", MARGIN, 2, 38, 12);
    }
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    rgb(this.doc, C.white);
    this.doc.text("PROPUESTA COMERCIAL  ·  CONFIDENCIAL  ·  AGOSTO 2026", PAGE_W - MARGIN, 9.5, {
      align: "right",
    });
    this.y = 26;
  }

  private drawFooter() {
    stroke(this.doc, C.line);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    rgb(this.doc, C.grayLight);
    this.doc.text(
      `DEVCEN  ·  Cliente: ${CLIENT}  ·  Oferta vigente 30 días  ·  ARS`,
      MARGIN,
      PAGE_H - 9
    );
    this.doc.text(`Pág. ${this.page}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
  }

  newPage() {
    this.drawFooter();
    this.doc.addPage();
    this.page += 1;
    this.drawHeader();
  }

  ensure(space: number) {
    if (this.y + space > PAGE_H - 20) this.newPage();
  }

  title(text: string) {
    this.ensure(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12);
    rgb(this.doc, C.ink);
    this.doc.text(text, MARGIN, this.y);
    this.y += 2.5;
    fill(this.doc, C.orange);
    this.doc.rect(MARGIN, this.y, 24, 1.1, "F");
    this.y += 6;
  }

  subtitle(text: string) {
    this.ensure(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    rgb(this.doc, C.inkSoft);
    this.doc.text(text, MARGIN, this.y);
    this.y += 5.5;
  }

  paragraph(text: string, opts?: { bold?: boolean; size?: number }) {
    this.ensure(10);
    this.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    this.doc.setFontSize(opts?.size ?? 9.3);
    rgb(this.doc, C.gray);
    const lines = this.doc.splitTextToSize(text, CONTENT_W);
    this.doc.text(lines, MARGIN, this.y);
    this.y += lines.length * 4.2 + 2.4;
  }

  bullet(text: string) {
    this.ensure(8);
    const indent = 7;
    const lineH = 4.15;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.2);
    rgb(this.doc, C.gray);
    const lines = this.doc.splitTextToSize(text, CONTENT_W - indent);
    const baseline = this.y;
    // Cuadrado alineado al centro óptico de la primera línea (Helvetica ~9.2 pt)
    fill(this.doc, C.orange);
    this.doc.rect(MARGIN, baseline - 2.35, 1.7, 1.7, "F");
    lines.forEach((line: string, i: number) => {
      this.doc.text(line, MARGIN + indent, baseline + i * lineH);
    });
    this.y = baseline + lines.length * lineH + 1.9;
  }

  table(headers: string[], rows: string[][], colWidths: number[]) {
    const rowH = 7.2;
    const headerH = 7.6;
    this.ensure(headerH + Math.min(rows.length, 6) * rowH + 4);

    let x = MARGIN;
    fill(this.doc, C.ink);
    this.doc.rect(MARGIN, this.y - 4.2, CONTENT_W, headerH, "F");
    fill(this.doc, C.orange);
    this.doc.rect(MARGIN, this.y - 4.2, 1.5, headerH, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.8);
    rgb(this.doc, C.white);
    headers.forEach((h, i) => {
      this.doc.text(h, x + 2.2, this.y);
      x += colWidths[i];
    });
    this.y += headerH - 1;

    rows.forEach((row, ri) => {
      this.ensure(rowH + 3);
      if (ri % 2 === 0) {
        fill(this.doc, C.bgSoft);
        this.doc.rect(MARGIN, this.y - 4, CONTENT_W, rowH, "F");
      }
      x = MARGIN;
      row.forEach((cell, i) => {
        const highlight =
          /Total|TOTAL|Recomend|obligatorio|Año 1|cerrado|asume|convenir|principal/i.test(cell) ||
          cell.includes("$ 45.000.000") ||
          cell.includes("$ 800.000") ||
          cell.includes("$ 1.400.000") ||
          cell.includes("$ 34.000.000") ||
          cell.includes("GRATIS") ||
          cell.includes("DEVCEN");
        this.doc.setFont("helvetica", highlight ? "bold" : "normal");
        this.doc.setFontSize(7.8);
        rgb(this.doc, C.inkSoft);
        const lines = this.doc.splitTextToSize(cell, colWidths[i] - 3.2);
        this.doc.text(lines[0] ?? "", x + 2.2, this.y);
        x += colWidths[i];
      });
      this.y += rowH;
    });
    this.y += 3.2;
  }

  callout(title: string, body: string) {
    const lines = this.doc.splitTextToSize(body, CONTENT_W - 10);
    const h = 8 + lines.length * 3.8;
    this.ensure(h + 4);
    fill(this.doc, C.bgSoft);
    stroke(this.doc, C.orange);
    this.doc.setLineWidth(0.45);
    this.doc.roundedRect(MARGIN, this.y - 2.5, CONTENT_W, h, 2, 2, "FD");
    fill(this.doc, C.orange);
    this.doc.rect(MARGIN, this.y - 2.5, 1.6, h, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.3);
    rgb(this.doc, C.ink);
    this.doc.text(title, MARGIN + 5, this.y + 1.8);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.1);
    rgb(this.doc, C.gray);
    this.doc.text(lines, MARGIN + 5, this.y + 6.5);
    this.y += h + 3.5;
  }

  cover() {
    fill(this.doc, C.ink);
    this.doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    fill(this.doc, C.orange);
    this.doc.rect(0, 0, 5, PAGE_H, "F");
    fill(this.doc, C.orangeDeep);
    this.doc.rect(5, 0, 0.8, PAGE_H, "F");

    if (this.logo) {
      this.doc.addImage(`data:image/png;base64,${this.logo}`, "PNG", MARGIN + 6, 26, 78, 26);
    }

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    rgb(this.doc, C.orange);
    this.doc.text("DOCUMENTO CONFIDENCIAL", MARGIN + 8, 68);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(22);
    rgb(this.doc, C.white);
    this.doc.text("PROPUESTA COMERCIAL", MARGIN + 8, 84);

    this.doc.setFontSize(13);
    rgb(this.doc, C.orange);
    this.doc.text("Plataforma corporativa de capacitación", MARGIN + 8, 96);
    this.doc.text("y matriz de competencias — NOV", MARGIN + 8, 104);

    stroke(this.doc, C.orange);
    this.doc.setLineWidth(0.7);
    this.doc.line(MARGIN + 8, 112, MARGIN + 52, 112);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    rgb(this.doc, C.grayLight);
    const intro = this.doc.splitTextToSize(
      "Una herramienta para unificar el seguimiento de competencias HSE en todas las sedes, capacitar al personal y mantener el control de avances y vencimientos.",
      CONTENT_W - 14
    );
    this.doc.text(intro, MARGIN + 8, 124);

    const meta: [string, string][] = [
      ["Cliente", "NOV"],
      ["Alcance operativo", "Aprox. 700 empleados | varias sedes | 40 a 45 capacitaciones"],
      ["Fecha", "Agosto 2026"],
      ["Vigencia", "30 días"],
      ["Moneda", "Pesos argentinos (ARS) + IVA"],
      ["Elaborado por", "DEVCEN Connected Systems"],
    ];
    let my = 150;
    meta.forEach(([k, v]) => {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7.5);
      rgb(this.doc, C.orange);
      this.doc.text(k.toUpperCase(), MARGIN + 8, my);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9.5);
      rgb(this.doc, C.white);
      const lines = this.doc.splitTextToSize(v, CONTENT_W - 16);
      this.doc.text(lines, MARGIN + 8, my + 4.5);
      my += 4.5 + lines.length * 4.2 + 4;
    });

    this.doc.setFontSize(8);
    rgb(this.doc, C.grayLight);
    this.doc.text("Dirigida a: NOV  ·  Dirección / HSE / Capacitación", MARGIN + 8, PAGE_H - 26);
    this.doc.text("Importes en pesos argentinos. No incluyen IVA ni otros impuestos.", MARGIN + 8, PAGE_H - 20);

    this.doc.addPage();
    this.page = 2;
    this.drawHeader();
  }

  build() {
    this.cover();

    this.title("1. ¿Qué proponemos?");
    this.paragraph(
      `Propuesta elaborada para ${CLIENT}. Consiste en implementar una plataforma corporativa de capacitación para que el personal de todas las sedes tome cursos, complete evaluaciones y obtenga certificados, mientras el área responsable gestiona contenidos, accesos y el seguimiento desde un solo lugar.`
    );
    this.paragraph(
      "El objetivo principal —y el valor más importante de esta inversión— es el seguimiento unificado de la matriz de competencias en todas las sedes. Hoy ese control suele estar repartido en planillas, mails y criterios distintos por ubicación. La plataforma concentra el estado real de cada persona (vigente, vencido, pendiente) y permite actuar a tiempo.",
      { bold: true }
    );
    this.paragraph(
      "No es un sitio con links a materiales sueltos: es una herramienta de trabajo para estandarizar la formación HSE, reducir riesgo operativo y demostrar cumplimiento interno."
    );

    this.title("2. Problemas que resuelve");
    [
      "Falta de una visión única de competencias entre sedes (cada sitio con su propia planilla).",
      "Dificultad para saber quién tiene cursos vencidos o sin completar.",
      "Pérdida de tiempo en seguimiento manual y pedidos de evidencias.",
      "Inconsistencia en cómo se capacita y se registra la aprobación.",
      "Riesgo de auditorías o auditorías internas sin evidencia ordenada.",
    ].forEach((b) => this.bullet(b));

    this.title("3. Qué hace la plataforma (en lenguaje de negocio)");
    [
      "Organiza capacitaciones por áreas / salas (seguridad, HSE, vial, emergencias, etc.).",
      "Da acceso controlado al personal autorizado (aprox. 700 personas).",
      "Publica materiales (video, PDF, PowerPoint y similares) dentro de cada curso.",
      "Evalúa con puntaje mínimo y emite certificados digitales con marca NOV.",
      "Muestra el progreso por persona, curso y sede.",
      "Centraliza la matriz de competencias: estado de cada requisito, alertas de vencidos y búsqueda con filtros.",
      "Permite a capacitadores / responsables administrar sin depender de un técnico para el día a día.",
    ].forEach((b) => this.bullet(b));
    this.callout(
      "Alcance dimensionado para NOV",
      "Base de cálculo: aprox. 700 empleados en varias sedes y entre 40 y 45 capacitaciones con material multimedia. Si el volumen crece de forma relevante, se revisa infraestructura y abono."
    );

    this.title("4. Formas de contratar");
    this.callout(
      "Situación de infraestructura de NOV",
      "NOV no dispone hoy de un servidor propio para alojar la plataforma. Por eso la opción recomendada es el alquiler con infraestructura a cargo de DEVCEN (servidor DigitalOcean, AWS S3 y PostgreSQL incluidos en el abono)."
    );
    this.paragraph(
      "Se presentan dos caminos. La Modalidad A (Alquiler) es la opción principal y recomendada. La Modalidad B (Venta total del producto) implica la cesión de derechos y un monto a negociar entre las partes."
    );

    // ---------- MODALIDAD A / ALQUILER (PRINCIPAL) ----------
    this.subtitle("Modalidad A — Alquiler (opción principal y recomendada)");
    this.paragraph(
      "NOV no compra el sistema como activo de código: alquila el servicio. DEVCEN implementa, opera y mantiene la plataforma. El abono mensual es obligatorio e incluye soporte. DEVCEN asume el costo mensual del servidor, AWS S3 y PostgreSQL — clave porque NOV no tiene servidor disponible."
    );
    this.table(
      ["Concepto de alquiler", "Importe (ARS)"],
      [
        ["Implementación y puesta en marcha (pago único)", "$ 34.000.000"],
        ["Abono mensual obligatorio (soporte + infraestructura)", "$ 1.400.000"],
      ],
      [118, 56]
    );
    this.paragraph(
      "La implementación de alquiler es un valor cerrado de $ 34.000.000 (configuración, marca NOV, estructura multi-sede, parametrización, capacitación y go-live). El abono mensual de $ 1.400.000 cubre soporte e infraestructura a cargo de DEVCEN."
    );
    this.paragraph("Qué incluye el abono mensual de $ 1.400.000:", { bold: true });
    [
      "Soporte técnico, mantenimiento, actualizaciones e incidencias.",
      "Disponibilidad 24/7 para incidencias críticas.",
      "Funcionalidades menores agregadas sin costo adicional mientras el abono esté activo.",
      "30 % de bonificación en la creación de otras plataformas a futuro.",
      "DEVCEN asume el costo mensual propio del servidor DigitalOcean (4 vCPU · 8 GB RAM · 100 GB SSD).",
      "DEVCEN asume el costo mensual propio de AWS S3 y PostgreSQL.",
      "NOV no recibe factura separada de DigitalOcean, AWS S3 ni PostgreSQL: van a cargo de DEVCEN.",
    ].forEach((b) => this.bullet(b));
    this.callout(
      "Ejemplo Año 1 — Modalidad A (Alquiler)",
      "$ 34.000.000 + 12 × $ 1.400.000 = $ 50.800.000. Infraestructura a cargo de DEVCEN (NOV sin servidor propio)."
    );

    // ---------- MODALIDAD B / VENTA ----------
    this.subtitle("Modalidad B — Venta total del producto (cesión de derechos)");
    this.paragraph(
      "Vender en forma total el producto significa que DEVCEN cede a NOV los derechos de uso/propiedad acordados sobre la plataforma implementada para su organización: NOV queda con el producto como activo propio, según el contrato de cesión que se firme entre las partes."
    );
    this.paragraph(
      "El monto por la entrega de derechos / venta total no está fijado en esta propuesta: se negociará entre las partes si NOV elige esta modalidad. Los precios son a convenir según alcance, plazos y condiciones de la cesión."
    );
    this.callout(
      "Si se elige la venta",
      "Se negociará un monto entre NOV y DEVCEN por la cesión de derechos. No hay un valor cerrado de venta en este documento: queda a acuerdo comercial entre las partes."
    );
    this.paragraph("Soporte después de la venta — NOV elige:", { bold: true });
    [
      "Soporte externo: NOV puede operar con un tercero o con su propio equipo técnico (sin abono de soporte a DEVCEN).",
      "Soporte DEVCEN (opcional): contratar a DEVCEN como soporte mensual por $ 800.000. En ese caso DEVCEN asume el costo mensual propio del servidor, AWS S3 y PostgreSQL — especialmente relevante porque NOV no tiene servidor disponible.",
      "Sin soporte DEVCEN: NOV debe resolver por su cuenta el hosting (servidor, base de datos y almacenamiento). Hoy NOV no cuenta con servidor propio; habría que provisionarlo antes o junto con la puesta en marcha.",
    ].forEach((b) => this.bullet(b));
    this.table(
      ["Concepto (Modalidad B — Venta)", "Importe (ARS)"],
      [
        ["Cesión / venta total del producto (derechos)", "A convenir entre las partes"],
        ["Soporte externo (terceros / equipo NOV)", "Según el proveedor que elija NOV"],
        ["Soporte DEVCEN (opcional)", "$ 800.000 / mes"],
      ],
      [118, 56]
    );
    this.paragraph("Bonificaciones si se contrata el soporte DEVCEN ($ 800.000/mes):", { bold: true });
    [
      "Disponibilidad 24/7 para incidencias críticas de la plataforma.",
      "Agregado de funcionalidades menores del sistema sin costo adicional.",
      "30 % de bonificación en la creación de otras plataformas a futuro.",
      "Infraestructura (servidor, AWS S3 y PostgreSQL) a cargo de DEVCEN mientras el soporte esté activo.",
    ].forEach((b) => this.bullet(b));

    this.title("5. Bonificaciones y ventajas DEVCEN");
    this.paragraph(
      "Además del precio, estas condiciones buscan que NOV gane valor desde el día uno y reduzca fricción para decidir."
    );
    [
      "Mejoras menores sin cargo con soporte mensual activo (alquiler o soporte DEVCEN en venta).",
      "Disponibilidad 24/7 en incidentes críticos del campus.",
      "30 % de bonificación en futuros desarrollos de plataformas con DEVCEN.",
      "Precio de soporte / alquiler congelado 12 meses desde el alta (sin suba por inflación en el primer año de contrato).",
      "Capacitación operativa al equipo NOV incluida en la puesta en marcha (sin cargo extra).",
      "Módulo de recordatorios por correo: implementación y costo de envíos a cargo de DEVCEN (bonificación por primer servicio contratado por NOV).",
      "Prioridad de atención y canal directo con DEVCEN durante la vigencia del soporte.",
      "Solución pensada para quien no tiene servidor propio: en alquiler (y con soporte DEVCEN) la infraestructura la asume DEVCEN.",
    ].forEach((b) => this.bullet(b));
    this.callout(
      "Por qué conviene el alquiler (opción principal)",
      "NOV no tiene servidor disponible. Con alquiler, DEVCEN pone la infraestructura, el soporte 24/7 y la operación. Unifica la matriz de competencias entre sedes sin que NOV tenga que armar hosting ni contratar terceros para sostener el sistema."
    );

    this.title("6. Recordatorios de vencimiento por correo");
    this.paragraph(
      "La plataforma puede avisar por email a los destinatarios correspondientes cuando una competencia o capacitación esté por vencer o ya vencida. Si NOV no lo activa, el seguimiento de vencidos sigue en pantalla (matriz y alertas), sin envíos automáticos."
    );
    this.table(
      ["Concepto", "Cuándo se paga", "ARS"],
      [
        ["Implementación del módulo de correos", "Una sola vez", "GRATIS"],
        ["Operación / costo de envíos de mail", "Mensual", "A cargo de DEVCEN"],
      ],
      [90, 48, 36]
    );
    this.callout(
      "Bonificación — primer servicio de NOV",
      "Los costos de mail van a cargo de DEVCEN como bonificación por ser el primer servicio contratado por NOV. NOV no abona implementación ni el gasto mensual de envíos."
    );

    this.title("7. Comparativo rápido");
    this.table(
      ["", "A — Alquiler (principal)", "B — Venta total"],
      [
        ["Qué obtiene NOV", "Uso del servicio gestionado", "Derechos del producto (cesión)"],
        ["Pago inicial", "$ 34.000.000", "Monto a convenir"],
        ["Mensual", "Obligatorio $ 1.400.000", "Opcional: externo o DEVCEN $ 800.000"],
        ["Servidor propio de NOV", "No hace falta", "Hace falta si no hay soporte DEVCEN"],
        ["Infra DO / S3 / Postgres", "A cargo de DEVCEN", "A cargo de DEVCEN si hay soporte"],
        ["24/7 + mejoras menores", "Incluido", "Con soporte DEVCEN"],
        ["Bonif. 30 % otras plataformas", "Incluido", "Con soporte DEVCEN"],
        ["Año 1 (referencia)", "$ 50.800.000", "Según acuerdo de cesión"],
      ],
      [52, 60, 62]
    );

    this.title("8. Plazos y forma de pago");
    this.table(
      ["Etapa", "Tiempo orientativo"],
      [
        ["Kick-off y definición de sedes / matriz", "Incluido en el plazo total"],
        ["Desarrollo, personalización e instalación", "Hasta 45 días corridos"],
        ["Pruebas con referentes HSE", "Incluido en el plazo total"],
        ["Terminación de la plataforma", "45 días desde el acuerdo de creación"],
      ],
      [110, 64]
    );
    this.paragraph("Modalidad de pago (implementación / alquiler):", { bold: true });
    [
      "50 % de la implementación: se abona una sola vez, al acordar la creación del proyecto.",
      "50 % restante: se abona a los 15 días de entregada / instalada la plataforma.",
      "El plazo de terminación de la plataforma es de 45 días desde el acuerdo de creación.",
      "Si se elige venta total: el monto por cesión de derechos y el cronograma de pago se acuerdan entre las partes.",
    ].forEach((b) => this.bullet(b));
    this.paragraph("Soporte y abono mensual:", { bold: true });
    [
      "El pago del soporte (y del abono mensual de alquiler) es por mes adelantado.",
      "El primer mes se abona al inicio del servicio de soporte / alquiler.",
      "Recordatorios por correo: implementación y costos de mail a cargo de DEVCEN (bonificación por primer servicio de NOV).",
      "Garantía de corrección de fallas críticas: 30 días posteriores al lanzamiento.",
    ].forEach((b) => this.bullet(b));
    this.callout(
      "Resumen de pago",
      "Alquiler: 50 % al acordar  ·  50 % a los 15 días de la instalación  ·  Soporte: mes adelantado  ·  Entrega: 45 días  ·  Venta: monto a convenir"
    );

    this.title("9. Qué entregamos");
    [
      "Plataforma en producción con acceso seguro (HTTPS) y marca NOV.",
      "Estructura lista para ~700 empleados y 40 a 45 capacitaciones.",
      "Matriz de competencias unificada entre sedes (seguimiento y alertas en pantalla).",
      "Cuentas de administración para el equipo responsable.",
      "Capacitación operativa (1 a 2 horas) al equipo de NOV.",
      "En alquiler (y con soporte DEVCEN en venta): servidor, S3 y PostgreSQL a cargo de DEVCEN — NOV no necesita servidor propio.",
      "Disponibilidad 24/7 y mejoras menores sin cargo mientras el soporte/alquiler esté activo.",
      "Exportación de avances / evidencias según necesidad del área.",
    ].forEach((b) => this.bullet(b));

    this.title("10. Resumen económico");
    this.table(
      ["Escenario", "Inicio", "Mensual", "Año 1"],
      [
        ["A — Alquiler (recomendado)", "$ 34.000.000", "$ 1.400.000", "$ 50.800.000"],
        ["B — Venta total (derechos)", "A convenir", "—", "Según acuerdo"],
        ["B — + soporte DEVCEN (opc.)", "A convenir", "$ 800.000", "Cesión + 12 × $ 800.000"],
        ["+ Recordatorios email (opcional)", "GRATIS", "A cargo de DEVCEN", "$ 0 para NOV"],
      ],
      [62, 40, 36, 36]
    );
    this.paragraph(
      "NOV no tiene servidor disponible: el alquiler resuelve hosting + soporte. En venta, el monto de cesión se negocia entre las partes; el soporte puede ser externo o DEVCEN ($ 800.000/mes). Importes en ARS, sin IVA. Vigencia: 30 días."
    );

    this.title("11. Próximos pasos");
    [
      "Confirmar Modalidad A (Alquiler — recomendada) o Modalidad B (Venta total a convenir).",
      "Si eligen venta: definir si el soporte será externo o DEVCEN, y avanzar la negociación del monto de cesión.",
      "Confirmar si activan recordatorios por correo (sin costo para NOV: mails a cargo de DEVCEN).",
      "Enviar logo NOV, sedes a unificar y prioridad de las primeras capacitaciones.",
      "Confirmar orden de compra y calendario (entrega en 45 días).",
    ].forEach((b) => this.bullet(b));

    this.y += 2;
    this.paragraph(
      "Quedamos a disposición para una reunión breve y ajustar la combinación de módulos a la realidad operativa y presupuestaria de NOV."
    );

    this.y += 8;
    this.ensure(48);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    rgb(this.doc, C.gray);
    this.doc.text("Atentamente,", MARGIN, this.y);
    this.y += 10;

    if (this.logo) {
      this.doc.addImage(`data:image/png;base64,${this.logo}`, "PNG", MARGIN, this.y, 52, 17);
      this.y += 20;
    }

    stroke(this.doc, C.line);
    this.doc.setLineWidth(0.4);
    this.doc.line(MARGIN, this.y, MARGIN + 70, this.y);
    this.y += 5.5;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    rgb(this.doc, C.ink);
    this.doc.text("DEVCEN Connected Systems", MARGIN, this.y);
    this.y += 4.5;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);
    rgb(this.doc, C.grayLight);
    this.doc.text("[Nombre de contacto]", MARGIN, this.y);
    this.y += 4;
    this.doc.text("[Teléfono / WhatsApp]  ·  [Correo]", MARGIN, this.y);

    this.y += 10;
    this.ensure(14);
    this.doc.setFont("helvetica", "italic");
    this.doc.setFontSize(7.4);
    rgb(this.doc, C.grayLight);
    const note = this.doc.splitTextToSize(
      "Documento comercial elaborado por DEVCEN Connected Systems para NOV. Importes en pesos argentinos (ARS), sin IVA. Vigencia 30 días. Cualquier cambio de alcance se acordará por escrito antes de ejecutarse.",
      CONTENT_W
    );
    this.doc.text(note, MARGIN, this.y);

    this.drawFooter();
  }

  save() {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    const buf = Buffer.from(this.doc.output("arraybuffer"));
    const targets = [OUT, OUT_ALT];
    for (const file of targets) {
      try {
        fs.writeFileSync(file, buf);
        console.log(`PDF generado: ${file}`);
      } catch (e) {
        console.warn(`No se pudo escribir ${file} (¿está abierto?):`, (e as Error).message);
      }
    }
  }
}

async function main() {
  const logo = await loadLogo();
  const pdf = new ProposalPdf(logo);
  pdf.build();
  pdf.save();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
