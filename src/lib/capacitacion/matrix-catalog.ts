/** Generated from the HSE 2026 WELLCHEK workbook. Do not import requisitos/vencidas sheets. */

export type MatrixRoomSlug =
  | "medio-ambiente"
  | "salud-ocupacional"
  | "seguridad-higiene"
  | "seguridad-vial"
  | "emergencias-respuestas"
  | "gestion-hse"
  | "competencias-tecnicas";

export type MatrixMaster = { code: string; name: string };
export type MatrixTopic = {
  code: string;
  title: string;
  sourceTitle: string;
  validityDays: number;
  hours: number;
  roomSlug: MatrixRoomSlug;
  justificacion: string;
};
export type MatrixCellDef = {
  sedeCode: string;
  puestoCode: string;
  tareaCode: string;
  topicCodes: string[];
};

export const MATRIX_YEAR = 2026;

export const MATRIX_SEDES: MatrixMaster[] = [
  { code: "tb-ar-crv-canadon-seco-insp", name: "TB AR CRV CANADON SECO INSP" },
  { code: "tb-ar-crv-ops-support", name: "TB AR CRV OPS SUPPORT" },
  { code: "tb-ar-crv-wellchek", name: "TB AR CRV WELLCHEK" },
  { code: "tb-ar-crv-escalante-insp", name: "TB AR CRV ESCALANTE INSP" },
  { code: "tb-ar-crv-cerro-drago-insp", name: "TB AR CRV CERRO DRAGO INSP" },
  { code: "tb-ar-crv-drill-pipe-insp", name: "TB AR CRV DRILL PIPE INSP" },
  { code: "tb-ar-hse", name: "TB AR HSE" },
  { code: "tb-ar-qual-and-maint-support", name: "TB AR QUAL AND MAINT SUPPORT" },
];

export const MATRIX_PUESTOS: MatrixMaster[] = [
  { code: "analista-de-control-documental", name: "Analista de Control Documental" },
  { code: "analista-operativo", name: "Analista Operativo" },
  { code: "asistente-esp-vaporizador-tb-y-vb", name: "Asistente Esp. Vaporizador Tb y Vb" },
  { code: "auxiliar-de-oficios", name: "Auxiliar de Oficios" },
  { code: "auxiliar-en-ensayo-no-destructivo", name: "Auxiliar en Ensayo no Destructivo" },
  { code: "ayudante-de-oficios", name: "Ayudante de Oficios" },
  { code: "ayudante-de-tareas-generales", name: "Ayudante de Tareas Generales" },
  { code: "ayudante-end", name: "Ayudante END" },
  { code: "ayudante-esp-ensayo-no-destructivo", name: "Ayudante ESP Ensayo No Destructivo" },
  { code: "coordinador-de-supervisores", name: "Coordinador de Supervisores" },
  { code: "coordinador-control-documental", name: "Coordinador Control Documental" },
  { code: "despachante-de-deposito", name: "Despachante de Deposito" },
  { code: "encargado-administrativo", name: "Encargado Administrativo" },
  { code: "encargado-de-mantenimiento", name: "Encargado de Mantenimiento" },
  { code: "gerente-de-operaciones-mza", name: "Gerente de Operaciones MZA" },
  { code: "gerente-de-servicios-ind", name: "Gerente de Servicios IND" },
  { code: "gerente-operaciones-tb-arg", name: "Gerente Operaciones TB ARG" },
  { code: "gerente-operaciones-tba-crv", name: "Gerente Operaciones TBA CRV" },
  { code: "ingresante", name: "Ingresante" },
  { code: "inspector", name: "Inspector" },
  { code: "jefe-de-servicios-ind", name: "Jefe de Servicios IND" },
  { code: "maestranza", name: "Maestranza" },
  { code: "maestro-tornero", name: "Maestro Tornero" },
  { code: "oficial-de-oficios", name: "Oficial de Oficios" },
  { code: "oficial-especializado-tornero", name: "Oficial Especializado Tornero" },
  { code: "oficial-tornero", name: "Oficial Tornero" },
  { code: "operador-calderista-esp", name: "Operador Calderista Esp." },
  { code: "operador-en-ensayo-no-destructivo", name: "Operador en Ensayo no Destructivo" },
  { code: "operador-esp-en-ensayo-no-destructivo", name: "Operador Esp. en Ensayo no Destructivo" },
  { code: "operador-foster", name: "Operador Foster" },
  { code: "operador-sky-truck-autoelevador-telescopico", name: "Operador Sky Truck Autoelevador Telescopico" },
  { code: "operario-inspeccion-cuplas-en-varillas", name: "Operario Inspección Cuplas en Varillas" },
  { code: "panolero-rec-y-despachante-de-materiales", name: "Pañolero - Rec y Despachante de Materiales" },
  { code: "responsable-de-administracion", name: "Responsable de Administracion" },
  { code: "secretaria-recepcionista", name: "Secretaria Recepcionista" },
  { code: "supervisor-ir-ind", name: "Supervisor IR IND" },
  { code: "supervisor-mill-audit-campana", name: "Supervisor MILL AUDIT (Campana)" },
  { code: "supervisor", name: "Supervisor" },
  { code: "vicepresidente-de-op-tva-sudamerica", name: "Vicepresidente de OP TVA SUDAMERICA" },
  { code: "gerente-de-planificacion-y-rendimiento-sam", name: "Gerente de Planificación y Rendimiento SAM" },
];

export const MATRIX_TAREAS: MatrixMaster[] = [
  { code: "supervisor", name: "SUPERVISOR" },
  { code: "conduccion-de-vehiculos", name: "CONDUCCION DE VEHICULOS" },
  { code: "operador-wch", name: "OPERADOR WCH" },
  { code: "ayudante-wch", name: "AYUDANTE WCH" },
  { code: "relevo-en-base", name: "RELEVO EN BASE" },
];

export const MATRIX_TOPICS: MatrixTopic[] = [
  {
    code: "camiones-industriales-pit",
    title: "Camiones Industriales (PIT)",
    sourceTitle: "Camiones Industriales Motorizados (PIT) (Todos)",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.019",
  },
  {
    code: "conciencia-ambiental",
    title: "Conciencia Ambiental",
    sourceTitle: "Conciencia Ambiental",
    validityDays: 365,
    hours: 1,
    roomSlug: "medio-ambiente",
    justificacion: "HSE 360: ENVMS.006 / ENVMS.005",
  },
  {
    code: "conduccion-y-gestion-de-viajes-conductores",
    title: "Conduccion y Gestion de Viajes (Conductores)",
    sourceTitle: "Conduccion y Gestion de Viajes (Conductores)",
    validityDays: 1095,
    hours: 5,
    roomSlug: "seguridad-vial",
    justificacion: "HSE 360: HSMSWT-001",
  },
  {
    code: "conduccion-y-gestion-de-viajes-todos",
    title: "Conduccion y Gestion de Viajes (Todos)",
    sourceTitle: "Conduccion y Gestion de Viajes (Todos)",
    validityDays: 730,
    hours: 1,
    roomSlug: "seguridad-vial",
    justificacion: "HSE 360: HSMSWT-001",
  },
  {
    code: "conservacion-auditiva",
    title: "Conservacion Auditiva",
    sourceTitle: "Conservacion Auditiva",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "HSE 360: HSMSWT-004",
  },
  {
    code: "control-de-energias-peligrosas-loto-autorizados",
    title: "Control de Energias Peligrosas LOTO (Autorizados)",
    sourceTitle: "Control de Energias Peligrosas (LOTO) (Empleados Autorizados)",
    validityDays: 365,
    hours: 2,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.023",
  },
  {
    code: "drogas-de-abuso-concientizacion-y-prevencion",
    title: "Drogas de abuso (concientización y prevención)",
    sourceTitle: "Drogas de abuso (concientización y prevención)",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "Cumplimiento de capacitación HSE/Salud.",
  },
  {
    code: "efectos-del-tabaco-sobre-la-salud",
    title: "Efectos del tabaco sobre la salud",
    sourceTitle: "Efectos del tabaco sobre la salud",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "Cumplimiento de capacitación HSE/Salud y concientización.",
  },
  {
    code: "equipo-de-proteccion-personal-epp",
    title: "Equipo de Proteccion Personal (EPP)",
    sourceTitle: "Equipo de Proteccion Personal (PPE)",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMSWT-026",
  },
  {
    code: "ergonomia-levantamiento-seguridad-en-la-espalda",
    title: "Ergonomia // / Levantamiento & Seguridad en la Espalda",
    sourceTitle: "Ergonomia // / Levantamiento & Seguridad en la Espalda",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "HSE 360: HSMSWT-008 / HSMSWT-012",
  },
  {
    code: "espacios-confinados-todos",
    title: "Espacios Confinados (Todos)",
    sourceTitle: "Espacios Confinados (Todos)",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.017",
  },
  {
    code: "gruas-y-equipos-de-izaje-todos",
    title: "Gruas y Equipos de Izaje (Todos)",
    sourceTitle: "Gruas y Equipos de Izaje (Todos)",
    validityDays: 365,
    hours: 2,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.007",
  },
  {
    code: "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets",
    title: "HIV/SIDA y otras enfermedades de transmisión sexual (ETS)",
    sourceTitle: "HIV/SIDA y otras enfermedades de transmisión sexual (ETS)",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "Cumplimiento de capacitación HSE/Salud y concientización al personal.",
  },
  {
    code: "gruas-y-equipos-de-izaje-operadores",
    title: "Gruas y Equipos de Izaje (Operadores)",
    sourceTitle: "HSMS.007 / Gruas y Equipos de Izaje (Operadores)",
    validityDays: 365,
    hours: 8,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.007",
  },
  {
    code: "las-reglas-que-salvan-vidas",
    title: "Las Reglas que Salvan Vidas",
    sourceTitle: "Las Reglas que Salvan Vidas",
    validityDays: 365,
    hours: 1,
    roomSlug: "competencias-tecnicas",
    justificacion: "HSE 360: HSMS.039",
  },
  {
    code: "patogenos-transmitidos-por-la-sangre",
    title: "Patogenos Transmitidos por la Sangre",
    sourceTitle: "Patogenos Transmitidos por la Sangre",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "HSE 360: HSMSWT-002",
  },
  {
    code: "plan-de-respuesta-ante-emergencias-rcp",
    title: "Plan de Respuesta ante Emergencias / RCP",
    sourceTitle: "Plan de Respuesta ante Eemergencias / HSMS.010 /Primeros Axulios & RCP/DEA / HSMSWT-002 / Patogenos Trasnmitidos por la Sangre",
    validityDays: 365,
    hours: 1,
    roomSlug: "emergencias-respuestas",
    justificacion: "HSE 360: HSEMS.034",
  },
  {
    code: "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma",
    title: "Prevención cardiovascular (factores de riesgo y señales de alarma)",
    sourceTitle: "Prevención cardiovascular (factores de riesgo y señales de alarma)",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "Cumplimiento de capacitación HSE/Salud.",
  },
  {
    code: "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp",
    title: "Primeros auxilios y Reanimación Cardio Pulmonar (RCP)",
    sourceTitle: "Primeros auxilios y Reanimación Cardio Pulmonar (RCP)",
    validityDays: 365,
    hours: 4,
    roomSlug: "emergencias-respuestas",
    justificacion: "Competencia crítica de respuesta ante emergencias.",
  },
  {
    code: "proteccion-contra-incendios-todos",
    title: "Proteccion Contra Incendios (Todos)",
    sourceTitle: "Proteccion Contra Incendios (Todos)",
    validityDays: 365,
    hours: 1,
    roomSlug: "emergencias-respuestas",
    justificacion: "HSE 360: HSMS.009",
  },
  {
    code: "reporte-y-gestion-de-incidentes-hse",
    title: "Reporte y Gestion de Incidentes HSE",
    sourceTitle: "Reporte y Gestion de Incidentes HSE (Todos)",
    validityDays: 365,
    hours: 1,
    roomSlug: "gestion-hse",
    justificacion: "HSE 360: HSEMS.050",
  },
  {
    code: "investigacion-de-incidentes-hse-supervisores",
    title: "Investigacion de Incidentes HSE (Supervisores)",
    sourceTitle: "Reporte, Gestion e Investigacion de Incidentes HSE (supervisores / investigadores (rol))",
    validityDays: 1095,
    hours: 2,
    roomSlug: "gestion-hse",
    justificacion: "HSE 360: HSEMS.050",
  },
  {
    code: "resguardo-de-maquinas-y-equipos",
    title: "Resguardo de Maquinas y Equipos",
    sourceTitle: "Resguardo de Maquinas & Equipos",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.053",
  },
  {
    code: "responsabilidades-del-supervisor",
    title: "Responsabilidades del Supervisor",
    sourceTitle: "Responsabilidades del Supervisor",
    validityDays: 365,
    hours: 1,
    roomSlug: "gestion-hse",
    justificacion: "Corporativo",
  },
  {
    code: "seguridad-basada-en-el-comportamiento-swa",
    title: "Seguridad Basada en el Comportamiento / SWA",
    sourceTitle: "Seguridad Basada en el Comportamiento (Observation Program) // HSMS.043 / Autoridad de Detener el Trabajo",
    validityDays: 365,
    hours: 1,
    roomSlug: "gestion-hse",
    justificacion: "HSE 360: HSEMS.017",
  },
  {
    code: "seguridad-electrica-todos",
    title: "Seguridad Electrica (Todos)",
    sourceTitle: "Seguridad Electrica (Todos)",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.018",
  },
  {
    code: "seguridad-quimica-todos",
    title: "Seguridad Quimica (Todos)",
    sourceTitle: "Seguridad Quimica (Todos)",
    validityDays: 730,
    hours: 1,
    roomSlug: "medio-ambiente",
    justificacion: "HSE 360: HSMSWT-016",
  },
  {
    code: "seguridad-aplicada-al-pozo-y-yacimiento",
    title: "Seguridad aplicada al Pozo y Yacimiento",
    sourceTitle: "Seguridad aplicada al Pozo & Yacimiento",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMS.027",
  },
  {
    code: "seguridad-con-escaleras",
    title: "Seguridad con Escaleras",
    sourceTitle: "Seguridad con Escaleras",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMSWT-038",
  },
  {
    code: "seguridad-con-escaleras-y-estantes",
    title: "Seguridad con Escaleras y Estantes",
    sourceTitle: "Seguridad con Escaleras // Estantes de Almacenamiento",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMSWT-038 / HSMSWT-045",
  },
  {
    code: "seguridad-con-la-radiacion",
    title: "Seguridad con la Radiacion",
    sourceTitle: "Seguridad con la Radiacion",
    validityDays: 365,
    hours: 2,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMSWT-025",
  },
  {
    code: "seguridad-para-trabajos-en-caliente",
    title: "Seguridad para Trabajos en Caliente",
    sourceTitle: "Seguridad para Trabajos en Caliente",
    validityDays: 365,
    hours: 1,
    roomSlug: "competencias-tecnicas",
    justificacion: "HSE 360: HSMSWT-021",
  },
  {
    code: "superficies-elevadas-todos",
    title: "Superficies Elevadas (Todos)",
    sourceTitle: "Superficies Elevadas (Todos)",
    validityDays: 365,
    hours: 1,
    roomSlug: "seguridad-higiene",
    justificacion: "HSE 360: HSMSWT-013",
  },
  {
    code: "vida-saludable-habitos-autocuidado-y-bienestar",
    title: "Vida saludable (hábitos, autocuidado y bienestar)",
    sourceTitle: "Vida saludable (hábitos, autocuidado y bienestar)",
    validityDays: 365,
    hours: 1,
    roomSlug: "salud-ocupacional",
    justificacion: "Cumplimiento de capacitación HSE/Salud y promoción de condiciones saludables.",
  },
];

const WELLCHEK_CELLS: MatrixCellDef[] = [
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "supervisor",
    tareaCode: "supervisor",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "investigacion-de-incidentes-hse-supervisores", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "responsabilidades-del-supervisor", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "ayudante-de-tareas-generales",
    tareaCode: "conduccion-de-vehiculos",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "operador-esp-en-ensayo-no-destructivo",
    tareaCode: "conduccion-de-vehiculos",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "operador-foster",
    tareaCode: "conduccion-de-vehiculos",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "supervisor",
    tareaCode: "conduccion-de-vehiculos",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "operador-esp-en-ensayo-no-destructivo",
    tareaCode: "operador-wch",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "supervisor",
    tareaCode: "operador-wch",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "ayudante-de-tareas-generales",
    tareaCode: "ayudante-wch",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "operador-esp-en-ensayo-no-destructivo",
    tareaCode: "ayudante-wch",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "operador-foster",
    tareaCode: "ayudante-wch",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "ayudante-de-tareas-generales",
    tareaCode: "relevo-en-base",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
  {
    sedeCode: "tb-ar-crv-wellchek",
    puestoCode: "operador-esp-en-ensayo-no-destructivo",
    tareaCode: "relevo-en-base",
    topicCodes: ["conciencia-ambiental", "seguridad-basada-en-el-comportamiento-swa", "plan-de-respuesta-ante-emergencias-rcp", "reporte-y-gestion-de-incidentes-hse", "gruas-y-equipos-de-izaje-todos", "gruas-y-equipos-de-izaje-operadores", "proteccion-contra-incendios-todos", "seguridad-electrica-todos", "camiones-industriales-pit", "control-de-energias-peligrosas-loto-autorizados", "seguridad-aplicada-al-pozo-y-yacimiento", "las-reglas-que-salvan-vidas", "resguardo-de-maquinas-y-equipos", "conduccion-y-gestion-de-viajes-todos", "conduccion-y-gestion-de-viajes-conductores", "patogenos-transmitidos-por-la-sangre", "conservacion-auditiva", "ergonomia-levantamiento-seguridad-en-la-espalda", "superficies-elevadas-todos", "seguridad-quimica-todos", "seguridad-para-trabajos-en-caliente", "seguridad-con-la-radiacion", "equipo-de-proteccion-personal-epp", "seguridad-con-escaleras", "seguridad-con-escaleras-y-estantes", "espacios-confinados-todos", "hiv-sida-y-otras-enfermedades-de-transmision-sexual-ets", "drogas-de-abuso-concientizacion-y-prevencion", "vida-saludable-habitos-autocuidado-y-bienestar", "primeros-auxilios-y-reanimacion-cardio-pulmonar-rcp", "prevencion-cardiovascular-factores-de-riesgo-y-senales-de-alarma", "efectos-del-tabaco-sobre-la-salud"],
  },
];

/** Misma terna puesto x tarea x temas en cada sector: el Excel fuente solo traia WELLCHEK. */
export const MATRIX_CELLS: MatrixCellDef[] = MATRIX_SEDES.flatMap((sede) =>
  WELLCHEK_CELLS.map((cell) => ({ ...cell, sedeCode: sede.code }))
);

export const MATRIX_DEMO_STUDENTS = [
  { dni: "30111222", firstName: "Ana", lastName: "Vega", email: "ana.vega@demo.nov", sedeCode: "tb-ar-crv-wellchek", puestoCode: "supervisor", tareaCode: "supervisor" },
  { dni: "30111333", firstName: "Luis", lastName: "Moreno", email: "luis.moreno@demo.nov", sedeCode: "tb-ar-crv-wellchek", puestoCode: "operador-esp-en-ensayo-no-destructivo", tareaCode: "operador-wch" },
  { dni: "30111444", firstName: "Marta", lastName: "Ruiz", email: "marta.ruiz@demo.nov", sedeCode: "tb-ar-crv-wellchek", puestoCode: "operador-foster", tareaCode: "ayudante-wch" },
] as const;

