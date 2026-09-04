export type CompetencyStatus = "vigente" | "vencida" | "sin_fecha";
export type ControlType = "Periódica" | "Evento";
export type StaffType = "propio" | "contratista";

export type CompetencyRecord = {
  id: string;
  name: string;
  legajo: string;
  area: string;
  role: string;
  tarea: string;
  competency: string;
  tipo: ControlType;
  vigencia: number; // días; 0 = no aplica
  horas: number;
  status: CompetencyStatus;
  expires: string | null; // ISO yyyy-MM-dd
  staff: StaffType;
};

// ─── Catálogos reales extraídos de la planilla ────────────────────────────────

export const AREAS = [
  "TB AR QUAL AND MAINT SUPPORT",
  "TB AR CRV CANADON SECO INSP",
  "TB AR CRV OPS SUPPORT",
  "TB AR CRV WELLCHEK",
  "TB AR CRV ESCALANTE INSP",
  "TB AR CRV CERRO DRAGO INSP",
  "TB AR CRV DRILL PIPE INSP",
  "TB AR HSE",
] as const;

export const TAREAS = [
  "SUPERVISOR",
  "CONDUCCION DE VEHICULOS",
  "OPERADOR WCH",
  "AYUDANTE WCH",
  "RELEVO EN BASE",
] as const;

export const ROLES = [
  "Operador Esp. en Ensayo no Destructivo",
  "Supervisor",
  "Ayudante de Tareas Generales",
  "Operador Foster",
  "Inspector de tubería",
  "Técnico HSE",
  "Soporte de calidad y mantenimiento",
] as const;

// 20 competencias más relevantes de la planilla real (nombres acortados para la UI)
export const COMPETENCIES = [
  "Conciencia Ambiental",
  "Seg. Basada en el Comportamiento / SWA",
  "Identificación de Peligros y Evaluación de Riesgos",
  "Plan de Respuesta ante Emergencias / RCP",
  "Reporte y Gestión de Incidentes HSE",
  "Grúas y Equipos de Izaje (Todos)",
  "Grúas y Equipos de Izaje (Operadores) — Cert.",
  "Protección Contra Incendios (Todos)",
  "Control de Energías Peligrosas LOTO (Todos)",
  "Control de Energías Peligrosas LOTO (Autorizados)",
  "Conducción y Gestión de Viajes (Todos)",
  "Conducción y Gestión de Viajes (Conductores)",
  "Ergonomía / Levantamiento & Seguridad en la Espalda",
  "Superficies Elevadas (Todos) — Cert.",
  "Seguridad Química (Todos)",
  "Seguridad para Trabajos en Caliente",
  "Equipo de Protección Personal (EPP)",
  "Seguridad con Escaleras",
  "Responsabilidades del Supervisor",
  "Programa de Agua (Todos)",
] as const;

export const STATUS_LABEL: Record<CompetencyStatus, string> = {
  vigente: "Vigente",
  vencida: "Vencida",
  sin_fecha: "Sin fecha",
};

// ─── Datos genéricos de muestra ───────────────────────────────────────────────
// Los nombres NO corresponden a personas reales; se usan códigos de empleado ficticios.

type Row = Omit<CompetencyRecord, "id">;

function row(
  name: string,
  legajo: string,
  area: string,
  role: string,
  tarea: string,
  competency: string,
  tipo: ControlType,
  vigencia: number,
  horas: number,
  status: CompetencyStatus,
  expires: string | null,
  staff: StaffType = "propio"
): Row {
  return { name, legajo, area, role, tarea, competency, tipo, vigencia, horas, status, expires, staff };
}

const RAW: Row[] = [
  // ── Empleado 01 — WELLCHEK / OPERADOR WCH ──
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Conciencia Ambiental", "Periódica", 365, 1, "vigente", "2026-05-20"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Seg. Basada en el Comportamiento / SWA", "Periódica", 365, 1, "vencida", "2025-06-30"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Identificación de Peligros y Evaluación de Riesgos", "Evento", 0, 1, "vigente", "2025-12-18"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Grúas y Equipos de Izaje (Todos)", "Periódica", 365, 2, "vigente", "2026-04-28"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Grúas y Equipos de Izaje (Operadores) — Cert.", "Periódica", 365, 8, "vigente", "2026-04-28"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Protección Contra Incendios (Todos)", "Periódica", 365, 1, "vigente", "2025-12-23"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Control de Energías Peligrosas LOTO (Todos)", "Evento", 0, 1, "vigente", "2025-06-30"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Control de Energías Peligrosas LOTO (Autorizados)", "Periódica", 365, 2, "vigente", "2026-05-20"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Todos)", "Periódica", 730, 1, "vigente", "2025-04-23"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Conductores)", "Periódica", 1095, 5, "vigente", "2027-12-22"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Equipo de Protección Personal (EPP)", "Periódica", 365, 1, "vigente", "2025-12-23"),
  row("EMP-001, Demo A.", "EMP-001", "TB AR CRV WELLCHEK", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Seguridad con Escaleras", "Periódica", 365, 1, "vigente", "2025-12-23"),

  // ── Empleado 02 — WELLCHEK / SUPERVISOR ──
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Conciencia Ambiental", "Periódica", 365, 1, "sin_fecha", null),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Seg. Basada en el Comportamiento / SWA", "Periódica", 365, 1, "vencida", "2025-02-19"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Plan de Respuesta ante Emergencias / RCP", "Periódica", 365, 1, "vigente", "2025-12-29"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Reporte y Gestión de Incidentes HSE", "Periódica", 365, 1, "vigente", "2025-12-17"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Grúas y Equipos de Izaje (Todos)", "Periódica", 365, 2, "sin_fecha", null),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Grúas y Equipos de Izaje (Operadores) — Cert.", "Periódica", 365, 8, "vencida", "2025-04-29"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Responsabilidades del Supervisor", "Periódica", 365, 1, "vigente", "2026-04-22"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Todos)", "Periódica", 730, 1, "vigente", "2025-04-23"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Conductores)", "Periódica", 1095, 5, "vigente", "2028-08-28"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Superficies Elevadas (Todos) — Cert.", "Periódica", 365, 1, "vigente", "2025-12-29"),
  row("EMP-002, Demo B.", "EMP-002", "TB AR CRV WELLCHEK", "Supervisor", "SUPERVISOR", "Equipo de Protección Personal (EPP)", "Periódica", 365, 1, "vigente", "2025-12-29"),

  // ── Empleado 03 — WELLCHEK / AYUDANTE WCH ──
  row("EMP-003, Demo C.", "EMP-003", "TB AR CRV WELLCHEK", "Operador Foster", "AYUDANTE WCH", "Conciencia Ambiental", "Periódica", 365, 1, "vigente", "2026-05-18"),
  row("EMP-003, Demo C.", "EMP-003", "TB AR CRV WELLCHEK", "Operador Foster", "AYUDANTE WCH", "Grúas y Equipos de Izaje (Todos)", "Periódica", 365, 2, "vigente", "2026-04-28"),
  row("EMP-003, Demo C.", "EMP-003", "TB AR CRV WELLCHEK", "Operador Foster", "AYUDANTE WCH", "Responsabilidades del Supervisor", "Periódica", 365, 1, "sin_fecha", null),
  row("EMP-003, Demo C.", "EMP-003", "TB AR CRV WELLCHEK", "Operador Foster", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Conductores)", "Periódica", 1095, 5, "vigente", "2028-09-30"),
  row("EMP-003, Demo C.", "EMP-003", "TB AR CRV WELLCHEK", "Operador Foster", "AYUDANTE WCH", "Seguridad para Trabajos en Caliente", "Periódica", 365, 1, "vencida", "2025-04-23"),

  // ── Empleado 04 — QUAL AND MAINT / OPERADOR ──
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Conciencia Ambiental", "Periódica", 365, 1, "vigente", "2026-04-22"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Seg. Basada en el Comportamiento / SWA", "Periódica", 365, 1, "vencida", "2025-06-19"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Identificación de Peligros y Evaluación de Riesgos", "Evento", 0, 1, "vigente", "2025-12-15"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Reporte y Gestión de Incidentes HSE", "Periódica", 365, 1, "vigente", "2025-12-15"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Grúas y Equipos de Izaje (Operadores) — Cert.", "Periódica", 365, 8, "vigente", "2026-04-29"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Protección Contra Incendios (Todos)", "Periódica", 365, 1, "vencida", "2025-06-27"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Ergonomía / Levantamiento & Seguridad en la Espalda", "Periódica", 365, 1, "vigente", "2025-12-15"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Seguridad Química (Todos)", "Periódica", 730, 1, "vigente", "2025-12-15"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Seguridad para Trabajos en Caliente", "Periódica", 365, 1, "vencida", "2025-06-27"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Equipo de Protección Personal (EPP)", "Periódica", 365, 1, "vigente", "2025-12-15"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "OPERADOR WCH", "Programa de Agua (Todos)", "Evento", 0, 1, "vigente", "2026-04-22"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Todos)", "Periódica", 730, 1, "vigente", "2025-04-23"),
  row("EMP-004, Demo D.", "EMP-004", "TB AR QUAL AND MAINT SUPPORT", "Soporte de calidad y mantenimiento", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Conductores)", "Periódica", 1095, 5, "vigente", "2026-07-08"),

  // ── Empleado 05 — CANADON SECO INSP / OPERADOR WCH ──
  row("EMP-005, Demo E.", "EMP-005", "TB AR CRV CANADON SECO INSP", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Conciencia Ambiental", "Periódica", 365, 1, "vigente", "2026-05-20"),
  row("EMP-005, Demo E.", "EMP-005", "TB AR CRV CANADON SECO INSP", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Seg. Basada en el Comportamiento / SWA", "Periódica", 365, 1, "vencida", "2025-06-30"),
  row("EMP-005, Demo E.", "EMP-005", "TB AR CRV CANADON SECO INSP", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Grúas y Equipos de Izaje (Operadores) — Cert.", "Periódica", 365, 8, "vigente", "2026-04-28"),
  row("EMP-005, Demo E.", "EMP-005", "TB AR CRV CANADON SECO INSP", "Operador Esp. en Ensayo no Destructivo", "OPERADOR WCH", "Superficies Elevadas (Todos) — Cert.", "Periódica", 365, 1, "vigente", "2025-12-23"),
  row("EMP-005, Demo E.", "EMP-005", "TB AR CRV CANADON SECO INSP", "Operador Esp. en Ensayo no Destructivo", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Conductores)", "Periódica", 1095, 5, "vigente", "2027-12-22"),

  // ── Empleado 06 — HSE ──
  row("EMP-006, Demo F.", "EMP-006", "TB AR HSE", "Técnico HSE", "SUPERVISOR", "Conciencia Ambiental", "Periódica", 365, 1, "vigente", "2026-04-22"),
  row("EMP-006, Demo F.", "EMP-006", "TB AR HSE", "Técnico HSE", "SUPERVISOR", "Seg. Basada en el Comportamiento / SWA", "Periódica", 365, 1, "vigente", "2026-06-19"),
  row("EMP-006, Demo F.", "EMP-006", "TB AR HSE", "Técnico HSE", "SUPERVISOR", "Identificación de Peligros y Evaluación de Riesgos", "Evento", 0, 1, "vigente", "2025-12-15"),
  row("EMP-006, Demo F.", "EMP-006", "TB AR HSE", "Técnico HSE", "SUPERVISOR", "Reporte y Gestión de Incidentes HSE", "Periódica", 365, 1, "vigente", "2025-12-15"),
  row("EMP-006, Demo F.", "EMP-006", "TB AR HSE", "Técnico HSE", "SUPERVISOR", "Ergonomía / Levantamiento & Seguridad en la Espalda", "Periódica", 365, 1, "vigente", "2025-12-15"),
  row("EMP-006, Demo F.", "EMP-006", "TB AR HSE", "Técnico HSE", "SUPERVISOR", "Programa de Agua (Todos)", "Evento", 0, 1, "vigente", "2026-04-22"),
  row("EMP-006, Demo F.", "EMP-006", "TB AR HSE", "Técnico HSE", "SUPERVISOR", "Responsabilidades del Supervisor", "Periódica", 365, 1, "vigente", "2026-05-21"),

  // ── Empleado 07 — ESCALANTE INSP / Contratista ──
  row("EMP-007, Demo G.", "C-007", "TB AR CRV ESCALANTE INSP", "Inspector de tubería", "OPERADOR WCH", "Seg. Basada en el Comportamiento / SWA", "Periódica", 365, 1, "vencida", "2025-06-19"),
  row("EMP-007, Demo G.", "C-007", "TB AR CRV ESCALANTE INSP", "Inspector de tubería", "OPERADOR WCH", "Protección Contra Incendios (Todos)", "Periódica", 365, 1, "vencida", "2025-06-27"),
  row("EMP-007, Demo G.", "C-007", "TB AR CRV ESCALANTE INSP", "Inspector de tubería", "OPERADOR WCH", "Seguridad para Trabajos en Caliente", "Periódica", 365, 1, "vencida", "2025-06-27"),
  row("EMP-007, Demo G.", "C-007", "TB AR CRV ESCALANTE INSP", "Inspector de tubería", "OPERADOR WCH", "Grúas y Equipos de Izaje (Todos)", "Periódica", 365, 2, "vigente", "2026-04-28"),
  row("EMP-007, Demo G.", "C-007", "TB AR CRV ESCALANTE INSP", "Inspector de tubería", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Conductores)", "Periódica", 1095, 5, "vigente", "2028-01-19", "contratista"),

  // ── Empleado 08 — CERRO DRAGO / Contratista / RELEVO EN BASE ──
  row("EMP-008, Demo H.", "C-008", "TB AR CRV CERRO DRAGO INSP", "Operador Esp. en Ensayo no Destructivo", "RELEVO EN BASE", "Conciencia Ambiental", "Periódica", 365, 1, "vigente", "2026-05-21"),
  row("EMP-008, Demo H.", "C-008", "TB AR CRV CERRO DRAGO INSP", "Operador Esp. en Ensayo no Destructivo", "RELEVO EN BASE", "Seg. Basada en el Comportamiento / SWA", "Periódica", 365, 1, "vencida", "2025-01-07"),
  row("EMP-008, Demo H.", "C-008", "TB AR CRV CERRO DRAGO INSP", "Operador Esp. en Ensayo no Destructivo", "RELEVO EN BASE", "Superficies Elevadas (Todos) — Cert.", "Periódica", 365, 1, "vencida", "2025-05-16"),
  row("EMP-008, Demo H.", "C-008", "TB AR CRV CERRO DRAGO INSP", "Operador Esp. en Ensayo no Destructivo", "RELEVO EN BASE", "Seguridad con Escaleras", "Periódica", 365, 1, "vencida", "2025-06-30"),
  row("EMP-008, Demo H.", "C-008", "TB AR CRV CERRO DRAGO INSP", "Operador Esp. en Ensayo no Destructivo", "CONDUCCION DE VEHICULOS", "Conducción y Gestión de Viajes (Conductores)", "Periódica", 1095, 5, "vigente", "2024-07-10", "contratista"),
];

export const MATRIX_RECORDS: CompetencyRecord[] = RAW.map((r, i) => ({ ...r, id: String(i + 1) }));

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export function matrixKpis(records: CompetencyRecord[] = MATRIX_RECORDS) {
  const total = records.length;
  const vigente = records.filter((r) => r.status === "vigente").length;
  const vencida = records.filter((r) => r.status === "vencida").length;
  const sin_fecha = records.filter((r) => r.status === "sin_fecha").length;
  const people = new Set(records.map((r) => r.legajo)).size;
  const hoursTotal = records.filter((r) => r.status === "vigente").reduce((n, r) => n + r.horas, 0);

  const own = records.filter((r) => r.staff === "propio").length;
  const contractor = records.filter((r) => r.staff === "contratista").length;

  const coverage = (list: CompetencyRecord[]) =>
    list.length ? Math.round((list.filter((r) => r.status === "vigente").length / list.length) * 100) : 0;

  const byArea = AREAS.map((area) => {
    const list = records.filter((r) => r.area === area);
    return { area, pct: coverage(list), count: list.length, expired: list.filter((r) => r.status === "vencida").length };
  });

  // alertas: vencidas agrupadas por empleado
  const expiredByPerson: Record<string, { name: string; area: string; count: number }> = {};
  records
    .filter((r) => r.status === "vencida")
    .forEach((r) => {
      if (!expiredByPerson[r.legajo]) {
        expiredByPerson[r.legajo] = { name: r.name, area: r.area, count: 0 };
      }
      expiredByPerson[r.legajo].count++;
    });

  const alertas = Object.entries(expiredByPerson)
    .map(([legajo, v]) => ({ legajo, ...v }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    people,
    vigente,
    vencida,
    sin_fecha,
    hoursTotal,
    conformity: coverage(records),
    ownPct: total ? Math.round((own / total) * 100) : 0,
    contractorPct: total ? Math.round((contractor / total) * 100) : 0,
    byArea,
    alertas,
  };
}
