export type DemoModuleId = "personal" | "capacitadores" | "progreso";

export type DemoOption = {
  id: string;
  title: string;
  badge: "Activo" | "Muestra";
  summary: string;
  detail: string;
  liveHref?: string;
  demoHref?: string;
};

export const PERSONAL_OPTIONS: DemoOption[] = [
  {
    id: "dni",
    title: "Documento (DNI)",
    badge: "Activo",
    summary: "El personal ingresa con el documento habilitado por los capacitadores.",
    detail:
      "Es la vía que ya está en producción en este campus: el DNI debe estar en la lista de habilitados. Sirve cuando el acceso se gestiona por documento y no hace falta cuenta corporativa.",
  },
  {
    id: "legajo",
    title: "Número de legajo",
    badge: "Muestra",
    summary: "Ingreso con el número interno de empleado, sin usar el DNI.",
    detail:
      "Útil en plantas y yacimientos donde el personal se identifica por legajo en RR.HH. o en el sistema de control de acceso. El capacitador habilita legajos en lugar de documentos.",
    demoHref: "/capacitacion/demo/acceso?modulo=personal&metodo=legajo",
  },
  {
    id: "email",
    title: "Email corporativo",
    badge: "Muestra",
    summary: "Usuario y contraseña del correo de la compañía.",
    detail:
      "Para personal de oficina o contratistas con casilla @nov.com. Permite recuperar acceso y auditar ingresos por cuenta, no por documento.",
    demoHref: "/capacitacion/demo/acceso?modulo=personal&metodo=email",
  },
  {
    id: "sso",
    title: "SSO / Active Directory",
    badge: "Muestra",
    summary: "Un clic con la sesión de Microsoft 365 o el directorio de la empresa.",
    detail:
      "El empleado entra con la misma cuenta de Windows o Outlook. No recuerda una clave extra y RR.HH. da o quita el acceso desde el directorio corporativo.",
    demoHref: "/capacitacion/demo/acceso?modulo=personal&metodo=sso",
  },
];

export const TRAINER_OPTIONS: DemoOption[] = [
  {
    id: "password",
    title: "Email y contraseña",
    badge: "Activo",
    summary: "Acceso de capacitador con cuenta de administración del campus.",
    detail:
      "Es la vía activa de este demo: el capacitador entra con email y contraseña, y desde ahí arma salas, habilita personal y carga cursos.",
    liveHref: "/capacitacion/admin/login",
  },
  {
    id: "sso",
    title: "SSO corporativo",
    badge: "Muestra",
    summary: "El capacitador entra con su cuenta de empresa, sin clave del campus.",
    detail:
      "Se integra con el directorio (Microsoft Entra / Google Workspace). Solo quienes tienen el rol de formador en la organización ven el panel.",
    demoHref: "/capacitacion/demo/acceso?modulo=capacitadores&metodo=sso",
  },
  {
    id: "2fa",
    title: "Doble factor (2FA)",
    badge: "Muestra",
    summary: "Email y contraseña, más un código de verificación.",
    detail:
      "Suma un código al celular o a la app autenticadora. Es la opción habitual cuando el panel maneja DNIs, evaluaciones y certificados.",
    demoHref: "/capacitacion/demo/acceso?modulo=capacitadores&metodo=2fa",
  },
];

export const PROGRESS_OPTIONS: DemoOption[] = [
  {
    id: "matrices",
    title: "Vista de matrices",
    badge: "Activo",
    summary: "Matriz de competencias ISO, sin entrar como personal ni como capacitador.",
    detail:
      "Tablero de supervisión (ISO 9001 / 14001 / 45001 cláusula 7.2): indicadores de conformidad, brechas y un buscador con filtros. No pide sesión de alumno ni de formador.",
    liveHref: "/capacitacion/matrices",
  },
  {
    id: "pin",
    title: "PIN de supervisión",
    badge: "Muestra",
    summary: "Un código corto para abrir las matrices en sala o en un totem.",
    detail:
      "El PIN no da de alta cursos ni edita DNIs: solo abre la vista de avance. Sirve en una sala de reuniones o en un monitor de planta.",
    demoHref: "/capacitacion/demo/acceso?modulo=progreso&metodo=pin",
  },
  {
    id: "enlace",
    title: "Enlace de supervisión",
    badge: "Muestra",
    summary: "URL privada, sin usuario, con vencimiento o restricción por red.",
    detail:
      "Se comparte con un auditor o un jefe de contrato. Entra directo a las matrices, sin cuenta de capacitador y sin mezclarse con el personal que cursa.",
    demoHref: "/capacitacion/demo/acceso?modulo=progreso&metodo=enlace",
  },
];
