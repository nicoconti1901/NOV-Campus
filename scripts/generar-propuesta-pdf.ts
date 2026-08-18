/**
 * Genera PDF profesional (versión comercial breve) de la propuesta.
 * Uso: npx tsx scripts/generar-propuesta-pdf.ts
 */
import { jsPDF } from "jspdf";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUT_PRIMARY = path.join(
  process.cwd(),
  "docs",
  "Propuesta-Plataforma-Corporativa-Capacitacion.pdf"
);
const OUT_FALLBACK = path.join(
  process.cwd(),
  "docs",
  "Propuesta-Plataforma-Corporativa-Capacitacion-ARS.pdf"
);
const LOGO = path.join(process.cwd(), "docs", "logoDEVCEN.png");

/** Negro suave (carbón) + naranja DEVCEN — sin azul */
const C = {
  ink: [45, 45, 48] as const,
  inkSoft: [70, 70, 75] as const,
  orange: [255, 140, 0] as const,
  gray: [90, 90, 95] as const,
  grayLight: [140, 140, 145] as const,
  line: [220, 220, 222] as const,
  bgSoft: [247, 247, 248] as const,
  white: [255, 255, 255] as const,
};

const MARGIN = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

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
  if (!fs.existsSync(LOGO)) return null;
  const png = await sharp(LOGO)
    .resize({ width: 720, withoutEnlargement: true })
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
    this.doc.rect(0, 0, PAGE_W, 14, "F");
    fill(this.doc, C.orange);
    this.doc.rect(0, 14, PAGE_W, 1.2, "F");

    if (this.logo) {
      this.doc.addImage(`data:image/png;base64,${this.logo}`, "PNG", MARGIN, 2.5, 28, 9);
    }
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    rgb(this.doc, C.white);
    this.doc.text("PROPUESTA COMERCIAL  ·  CONFIDENCIAL  ·  AGOSTO 2026", PAGE_W - MARGIN, 8.5, {
      align: "right",
    });
    this.y = 24;
  }

  private drawFooter() {
    stroke(this.doc, C.line);
    this.doc.setLineWidth(0.3);
    this.doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    rgb(this.doc, C.grayLight);
    this.doc.text("DEVCEN  ·  Cliente: Casino Club  ·  Oferta vigente 30 días  ·  ARS", MARGIN, PAGE_H - 9);
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
    this.doc.rect(MARGIN, this.y, 22, 1, "F");
    this.y += 6;
  }

  subtitle(text: string) {
    this.ensure(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    rgb(this.doc, C.inkSoft);
    this.doc.text(text, MARGIN, this.y);
    this.y += 5.5;
  }

  paragraph(text: string, opts?: { bold?: boolean; size?: number }) {
    this.ensure(10);
    this.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    this.doc.setFontSize(opts?.size ?? 9.5);
    rgb(this.doc, C.gray);
    const lines = this.doc.splitTextToSize(text, CONTENT_W);
    this.doc.text(lines, MARGIN, this.y);
    this.y += lines.length * 4.3 + 2.5;
  }

  bullet(text: string) {
    this.ensure(7);
    fill(this.doc, C.orange);
    this.doc.circle(MARGIN + 1.4, this.y - 1.1, 0.85, "F");
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    rgb(this.doc, C.gray);
    const lines = this.doc.splitTextToSize(text, CONTENT_W - 6);
    this.doc.text(lines, MARGIN + 5, this.y);
    this.y += lines.length * 4.2 + 1.8;
  }

  table(headers: string[], rows: string[][], colWidths: number[]) {
    const rowH = 7;
    const headerH = 7.5;
    this.ensure(headerH + rows.length * rowH + 4);

    let x = MARGIN;
    fill(this.doc, C.ink);
    this.doc.rect(MARGIN, this.y - 4.2, CONTENT_W, headerH, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    rgb(this.doc, C.white);
    headers.forEach((h, i) => {
      this.doc.text(h, x + 2, this.y);
      x += colWidths[i];
    });
    this.y += headerH - 1;

    rows.forEach((row, ri) => {
      this.ensure(rowH + 2);
      if (ri % 2 === 0) {
        fill(this.doc, C.bgSoft);
        this.doc.rect(MARGIN, this.y - 4, CONTENT_W, rowH, "F");
      }
      x = MARGIN;
      row.forEach((cell, i) => {
        const highlight =
          cell.includes("8.500.000") ||
          cell.includes("650.000") ||
          cell.includes("16.300.000") ||
          cell.includes("Total") ||
          cell.toLowerCase().includes("recom");
        this.doc.setFont("helvetica", highlight ? "bold" : "normal");
        this.doc.setFontSize(8);
        rgb(this.doc, C.inkSoft);
        const lines = this.doc.splitTextToSize(cell, colWidths[i] - 3);
        this.doc.text(lines[0] ?? "", x + 2, this.y);
        x += colWidths[i];
      });
      this.y += rowH;
    });
    this.y += 3.5;
  }

  callout(title: string, body: string) {
    this.ensure(18);
    fill(this.doc, C.bgSoft);
    stroke(this.doc, C.orange);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(MARGIN, this.y - 2.5, CONTENT_W, 15, 2, 2, "FD");
    fill(this.doc, C.orange);
    this.doc.rect(MARGIN, this.y - 2.5, 1.6, 15, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    rgb(this.doc, C.ink);
    this.doc.text(title, MARGIN + 5, this.y + 2);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);
    rgb(this.doc, C.gray);
    this.doc.text(body, MARGIN + 5, this.y + 7.5);
    this.y += 18;
  }

  cover() {
    fill(this.doc, C.ink);
    this.doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    fill(this.doc, C.orange);
    this.doc.rect(0, 0, 5, PAGE_H, "F");

    if (this.logo) {
      // Logo sobre fondo oscuro: área clara sutil
      fill(this.doc, C.white);
      this.doc.roundedRect(MARGIN + 6, 28, 52, 18, 2, 2, "F");
      this.doc.addImage(`data:image/png;base64,${this.logo}`, "PNG", MARGIN + 9, 31, 46, 12);
    }

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    rgb(this.doc, C.orange);
    this.doc.text("DOCUMENTO CONFIDENCIAL", MARGIN + 8, 62);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(24);
    rgb(this.doc, C.white);
    this.doc.text("PROPUESTA COMERCIAL", MARGIN + 8, 78);

    this.doc.setFontSize(14);
    rgb(this.doc, C.orange);
    this.doc.text("Plataforma de Capacitaciones", MARGIN + 8, 90);
    this.doc.text("para su organización", MARGIN + 8, 98);

    stroke(this.doc, C.orange);
    this.doc.setLineWidth(0.7);
    this.doc.line(MARGIN + 8, 108, MARGIN + 48, 108);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    rgb(this.doc, C.grayLight);
    const intro = this.doc.splitTextToSize(
      "Una solución simple para capacitar equipos, controlar avances y emitir certificados con la marca de su empresa.",
      CONTENT_W - 12
    );
    this.doc.text(intro, MARGIN + 8, 120);

    const meta: [string, string][] = [
      ["Cliente", "Casino Club"],
      ["Fecha", "Agosto 2026"],
      ["Vigencia", "30 días"],
      ["Moneda", "Pesos argentinos (ARS)"],
      ["Elaborado por", "DEVCEN Connected Systems"],
    ];
    let my = 150;
    meta.forEach(([k, v]) => {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(8);
      rgb(this.doc, C.orange);
      this.doc.text(k.toUpperCase(), MARGIN + 8, my);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(10);
      rgb(this.doc, C.white);
      this.doc.text(v, MARGIN + 8, my + 5);
      my += 13;
    });

    this.doc.setFontSize(8);
    rgb(this.doc, C.grayLight);
    this.doc.text("Dirigida a: Casino Club  ·  Dirección / Área de Capacitación", MARGIN + 8, PAGE_H - 26);
    this.doc.text("Importes en pesos argentinos. No incluyen IVA ni otros impuestos.", MARGIN + 8, PAGE_H - 20);

    this.doc.addPage();
    this.page = 2;
    this.drawHeader();
  }

  build() {
    this.cover();

    this.title("1. ¿Qué proponemos?");
    this.paragraph(
      "Propuesta elaborada para Casino Club. Consiste en implementar una plataforma de capacitaciones a medida de su organización: sus colaboradores estudian, rinden y obtienen certificados digitales, mientras su equipo gestiona cursos, accesos y avances desde un panel simple."
    );
    this.paragraph(
      "No es un sitio informativo con links a cursos: es una herramienta de trabajo para formar al personal de Casino Club con control y respaldo formal."
    );

    this.title("2. Beneficios para su empresa");
    [
      "Capacitaciones organizadas por áreas o temas.",
      "Acceso solo para personas autorizadas (por documento / DNI).",
      "Materiales en video y documentos, disponibles cuando el equipo lo necesite.",
      "Evaluaciones con puntaje mínimo de aprobación.",
      "Certificados PDF con su logo y datos del participante.",
      "Varios responsables pueden administrar la plataforma al mismo tiempo.",
      "Seguimiento claro de quién avanzó y quién ya aprobó.",
    ].forEach((b) => this.bullet(b));

    this.title("3. Cómo se usa");
    this.subtitle("Para el equipo de gestión");
    [
      "Crear y publicar capacitaciones.",
      "Subir videos y archivos.",
      "Habilitar participantes (uno por uno o en lote).",
      "Ver avances y exportar reportes.",
    ].forEach((b) => this.bullet(b));
    this.subtitle("Para los colaboradores");
    [
      "Ingresan con un enlace privado y su documento.",
      "Completan su perfil una sola vez.",
      "Ven el material, rinden la evaluación y descargan el certificado.",
    ].forEach((b) => this.bullet(b));

    this.title("4. Inversión — Plataforma como servicio");
    this.paragraph(
      "Modelo de servicio gestionado para Casino Club: la plataforma se implementa con su marca y se opera bajo licencia de uso mensual. Montos en pesos argentinos."
    );
    this.callout(
      "Condiciones de precio",
      "Montos en ARS + IVA. Vigencia 30 días. Si se demora la contratación, se puede actualizar por inflación."
    );

    this.subtitle("4.1 Inversión y abono");
    this.table(
      ["Concepto", "Importe (ARS)"],
      [
        ["Implementación inicial (pago único)", "$ 8.500.000"],
        [
          "Abono mensual (licencia + soporte + infraestructura)",
          "$ 650.000",
        ],
        ["Capacidad incluida", "Hasta 1.500 alumnos"],
      ],
      [120, 54]
    );
    this.callout(
      "Ejemplo Año 1",
      "$ 8.500.000 + 12 × $ 650.000  =  $ 16.300.000"
    );
    this.paragraph(
      "El abono mensual de $ 650.000 ya incluye el gasto de infraestructura (servidores, hosting, HTTPS, monitoreo y respaldos). Casino Club no abona servidores por separado."
    );

    this.subtitle("4.2 Qué incluye el abono mensual ($ 650.000)");
    [
      "Licencia de uso de la plataforma durante la vigencia del servicio.",
      "Infraestructura: servidores, hosting, acceso seguro (HTTPS), monitoreo y respaldos.",
      "Soporte operativo e incidencias en horario hábil.",
      "Mantenimiento correctivo y actualizaciones menores de estabilidad.",
      "Hasta 1.500 alumnos activos.",
    ].forEach((b) => this.bullet(b));

    this.subtitle("4.3 Propiedad y derechos de uso");
    [
      "El código fuente es propiedad del desarrollador (DEVCEN Connected Systems).",
      "Casino Club obtiene derecho de uso durante la vigencia del servicio.",
      "Los contenidos, datos de alumnos, capacitaciones y materiales cargados por Casino Club son de su propiedad.",
      "Al finalizar el servicio, se entrega exportación de datos y materiales del cliente.",
    ].forEach((b) => this.bullet(b));

    this.subtitle("4.4 Gastos extras por agregados o modificaciones");
    this.paragraph(
      "Pedidos fuera del alcance inicial (nuevas funciones, cambios de flujo, integraciones, reportes especiales, rediseños o cargas de trabajo adicionales) se cotizan aparte como gasto extra:"
    );
    this.table(
      ["Tipo de pedido", "Modalidad", "Referencia (ARS)"],
      [
        ["Ajuste menor / cambio puntual", "Por hora", "$ 45.000 / h"],
        ["Mejora o módulo chico", "Paquete cerrado", "Desde $ 250.000"],
        ["Desarrollo o integración media", "Paquete cerrado", "Desde $ 600.000"],
        ["Bolsa de horas mensuales (opcional)", "Abono extra", "$ 180.000 (4 h)"],
      ],
      [70, 42, 62]
    );
    this.paragraph(
      "Todo extra se confirma por escrito (alcance, plazo e importe) antes de ejecutarse. No se inicia trabajo adicional sin conformidad de Casino Club."
    );

    this.title("5. Plazos y pago");
    this.table(
      ["Etapa", "Tiempo orientativo"],
      [
        ["Inicio y definición de marca", "2 – 3 días hábiles"],
        ["Implementación y personalización", "2 – 3 semanas"],
        ["Pruebas con su equipo", "3 – 5 días hábiles"],
        ["Puesta en marcha", "3 a 5 semanas en total"],
      ],
      [100, 74]
    );
    [
      "Implementación: 50 % al firmar / 50 % al salir al aire.",
      "Abono mensual (licencia + soporte + infraestructura): primer mes al firmar; luego mensual adelantado.",
      "Contrato de servicio sugerido: 12 meses.",
      "Garantía de corrección de fallas críticas: 30 días después del lanzamiento.",
    ].forEach((b) => this.bullet(b));

    this.title("6. Qué entregamos");
    [
      "Plataforma funcionando con acceso seguro (HTTPS) y dominio configurado.",
      "Marca Casino Club aplicada en el portal y en los certificados.",
      "Cuentas de administración listas para usar.",
      "Capacitación breve al equipo (1 a 2 horas).",
      "Respaldos activos y posibilidad de exportar avances.",
    ].forEach((b) => this.bullet(b));

    this.title("7. Resumen económico");
    this.table(
      ["Concepto", "Importe"],
      [
        ["Implementación inicial", "$ 8.500.000"],
        ["Abono mensual (c/ infraestructura)", "$ 650.000"],
        ["Capacidad", "Hasta 1.500 alumnos"],
        ["Año 1 (sin extras)", "$ 16.300.000"],
        ["Extras (agregar / modificar)", "Según tabla 4.4"],
      ],
      [110, 64]
    );

    this.title("8. Próximos pasos");
    [
      "Confirmar conformidad con el modelo de plataforma como servicio.",
      "Enviar logo, colores y dominio deseado de Casino Club.",
      "Definir las primeras áreas / capacitaciones a cargar.",
      "Confirmar orden de compra y calendario de implementación.",
    ].forEach((b) => this.bullet(b));

    this.y += 3;
    this.paragraph(
      "Quedamos a disposición para una reunión breve y ajustar la propuesta a la realidad de su equipo."
    );

    this.y += 8;
    this.ensure(42);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9.5);
    rgb(this.doc, C.gray);
    this.doc.text("Atentamente,", MARGIN, this.y);
    this.y += 12;

    if (this.logo) {
      this.doc.addImage(`data:image/png;base64,${this.logo}`, "PNG", MARGIN, this.y - 2, 36, 10);
      this.y += 14;
    }

    stroke(this.doc, C.line);
    this.doc.setLineWidth(0.4);
    this.doc.line(MARGIN, this.y, MARGIN + 65, this.y);
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
    this.ensure(12);
    this.doc.setFont("helvetica", "italic");
    this.doc.setFontSize(7.5);
    rgb(this.doc, C.grayLight);
    const note = this.doc.splitTextToSize(
      "Documento comercial. Importes en pesos argentinos (ARS), sin IVA. Vigencia 30 días. Cualquier cambio de alcance se acordará por escrito antes de ejecutarse.",
      CONTENT_W
    );
    this.doc.text(note, MARGIN, this.y);

    this.drawFooter();
  }

  save() {
    fs.mkdirSync(path.dirname(OUT_PRIMARY), { recursive: true });
    const buf = Buffer.from(this.doc.output("arraybuffer"));
    try {
      fs.writeFileSync(OUT_PRIMARY, buf);
      console.log(`PDF generado: ${OUT_PRIMARY}`);
    } catch {
      fs.writeFileSync(OUT_FALLBACK, buf);
      console.log(`PDF generado (el original estaba abierto): ${OUT_FALLBACK}`);
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
