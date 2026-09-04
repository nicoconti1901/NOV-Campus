import { ASSIGNMENT_STATUS, PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import { MATRIX_CELLS, MATRIX_SEDES } from "@/lib/capacitacion/matrix-catalog";
import { addDays } from "@/lib/capacitacion/matrix-engine";

export const DEMO_STUDENTS_PER_SEDE = 40;
export const DEMO_BULK_DNI_PREFIX = "32";
export const DEMO_BULK_EMAIL_DOMAIN = "lote.demo.nov";

export type DemoProgressProfile =
  | "star"
  | "solid"
  | "in_progress"
  | "due_soon"
  | "lapsed"
  | "behind"
  | "new_hire";

export type DemoRosterPerson = {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sedeCode: string;
  puestoCode: string;
  tareaCode: string;
  profile: DemoProgressProfile;
};

export type DemoAssignmentOutcome = {
  status: string;
  dueAt: Date;
  completedAt: Date | null;
  progressStatus: string | null;
  score: number | null;
  passedAttempt: boolean;
};

const FIRST_NAMES = [
  "Agustin",
  "Camila",
  "Diego",
  "Elena",
  "Facundo",
  "Gisela",
  "Hernan",
  "Ivana",
  "Julian",
  "Karina",
  "Lautaro",
  "Melina",
  "Nicolas",
  "Paula",
  "Rocio",
  "Santiago",
  "Tamara",
  "Ulises",
  "Valentina",
  "Walter",
  "Yesica",
  "Bruno",
  "Celeste",
  "Dario",
  "Emilia",
  "Franco",
  "Graciela",
  "Hugo",
  "Irina",
  "Joaquin",
  "Luciana",
  "Matias",
  "Noelia",
  "Oscar",
  "Patricia",
  "Ramiro",
  "Silvina",
  "Tomas",
  "Veronica",
  "Xavier",
];

const LAST_NAMES = [
  "Acosta",
  "Bustos",
  "Cabrera",
  "Dominguez",
  "Espinoza",
  "Fernandez",
  "Gimenez",
  "Herrera",
  "Ibarra",
  "Juarez",
  "Kuzman",
  "Lopez",
  "Molina",
  "Nunez",
  "Ojeda",
  "Paz",
  "Quiroga",
  "Rios",
  "Sosa",
  "Torres",
  "Urrutia",
  "Villalba",
  "Arias",
  "Benedetti",
  "Correa",
  "Diaz",
  "Escobar",
  "Farias",
  "Godoy",
  "Hurtado",
  "Iglesias",
  "Jara",
  "Ledesma",
  "Mansilla",
  "Navarro",
  "Ortiz",
  "Peralta",
  "Roldan",
  "Salinas",
  "Vega",
];

const SEDE_PROFILE_MIX: Record<string, Partial<Record<DemoProgressProfile, number>>> = {
  "tb-ar-crv-canadon-seco-insp": { behind: 16, lapsed: 12, in_progress: 8, solid: 4 },
  "tb-ar-crv-ops-support": { due_soon: 18, solid: 12, star: 6, in_progress: 4 },
  "tb-ar-crv-wellchek": { solid: 10, in_progress: 8, due_soon: 8, lapsed: 6, new_hire: 4, behind: 4 },
  "tb-ar-crv-escalante-insp": { star: 16, solid: 16, in_progress: 8 },
  "tb-ar-crv-cerro-drago-insp": { behind: 20, lapsed: 12, new_hire: 8 },
  "tb-ar-crv-drill-pipe-insp": { new_hire: 20, in_progress: 12, due_soon: 8 },
  "tb-ar-hse": { star: 32, solid: 8 },
  "tb-ar-qual-and-maint-support": { due_soon: 16, solid: 14, in_progress: 10 },
};

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

export function matrixRoleSlots() {
  const sedeCode = MATRIX_SEDES[0]?.code;
  return MATRIX_CELLS.filter((cell) => cell.sedeCode === sedeCode).map((cell) => ({
    puestoCode: cell.puestoCode,
    tareaCode: cell.tareaCode,
  }));
}

export function expandProfileMix(
  mix: Partial<Record<DemoProgressProfile, number>>,
  total = DEMO_STUDENTS_PER_SEDE
): DemoProgressProfile[] {
  const list: DemoProgressProfile[] = [];
  for (const [profile, count] of Object.entries(mix) as [DemoProgressProfile, number][]) {
    for (let i = 0; i < count; i += 1) list.push(profile);
  }
  while (list.length < total) list.push("solid");
  return list.slice(0, total);
}

export function bulkDemoDni(sedeIndex: number, studentIndex: number) {
  return `${DEMO_BULK_DNI_PREFIX}${String(sedeIndex + 1).padStart(2, "0")}${String(studentIndex + 1).padStart(4, "0")}`;
}

export function buildDemoRoster(): DemoRosterPerson[] {
  const roles = matrixRoleSlots();
  if (roles.length === 0) return [];

  const people: DemoRosterPerson[] = [];

  MATRIX_SEDES.forEach((sede, sedeIndex) => {
    const profiles = expandProfileMix(SEDE_PROFILE_MIX[sede.code] ?? { solid: DEMO_STUDENTS_PER_SEDE });
    for (let studentIndex = 0; studentIndex < DEMO_STUDENTS_PER_SEDE; studentIndex += 1) {
      const nameIndex = sedeIndex * DEMO_STUDENTS_PER_SEDE + studentIndex;
      const firstName = pick(FIRST_NAMES, nameIndex);
      const lastName = pick(LAST_NAMES, nameIndex * 3 + sedeIndex);
      const dni = bulkDemoDni(sedeIndex, studentIndex);
      const role = pick(roles, studentIndex);
      people.push({
        dni,
        firstName,
        lastName,
        email: `${slug(firstName)}.${slug(lastName)}.${dni}@${DEMO_BULK_EMAIL_DOMAIN}`,
        phone: `2974${String(100000 + nameIndex).slice(-6)}`,
        sedeCode: sede.code,
        puestoCode: role.puestoCode,
        tareaCode: role.tareaCode,
        profile: profiles[studentIndex],
      });
    }
  });

  return people;
}

export function resolveDemoAssignment(
  profile: DemoProgressProfile,
  index: number,
  total: number,
  validityDays: number,
  now: Date,
  salt: number
): DemoAssignmentOutcome {
  const ratio = total <= 1 ? 0 : index / total;
  const rand = mulberry32(salt + index * 17);
  const scoreHigh = 78 + Math.floor(rand() * 22);
  const scoreMid = 42 + Math.floor(rand() * 22);
  const pendingDue = addDays(now, Math.max(validityDays, 90));

  const completedFar = (): DemoAssignmentOutcome => {
    const completedAt = addDays(now, -(50 + Math.floor(rand() * 120)));
    return {
      status: ASSIGNMENT_STATUS.COMPLETED,
      completedAt,
      dueAt: addDays(completedAt, validityDays),
      progressStatus: PROGRESS_STATUS.COMPLETED,
      score: scoreHigh,
      passedAttempt: true,
    };
  };

  const assignedFar = (progressStatus: string | null, score: number | null): DemoAssignmentOutcome => ({
    status: ASSIGNMENT_STATUS.ASSIGNED,
    dueAt: pendingDue,
    completedAt: null,
    progressStatus,
    score,
    passedAttempt: false,
  });

  const dueSoonAssigned = (): DemoAssignmentOutcome => ({
    status: ASSIGNMENT_STATUS.ASSIGNED,
    dueAt: addDays(now, 4 + Math.floor(rand() * 22)),
    completedAt: null,
    progressStatus: rand() > 0.45 ? PROGRESS_STATUS.IN_PROGRESS : PROGRESS_STATUS.NOT_STARTED,
    score: rand() > 0.45 ? scoreMid : null,
    passedAttempt: false,
  });

  const dueSoonCompleted = (): DemoAssignmentOutcome => {
    const remaining = 6 + Math.floor(rand() * 20);
    const completedAt = addDays(now, -(validityDays - remaining));
    return {
      status: ASSIGNMENT_STATUS.COMPLETED,
      completedAt,
      dueAt: addDays(now, remaining),
      progressStatus: PROGRESS_STATUS.COMPLETED,
      score: scoreHigh,
      passedAttempt: true,
    };
  };

  const expired = (hadCompleted: boolean): DemoAssignmentOutcome => {
    if (hadCompleted) {
      const completedAt = addDays(now, -(validityDays + 12 + Math.floor(rand() * 40)));
      return {
        status: ASSIGNMENT_STATUS.EXPIRED,
        completedAt,
        dueAt: addDays(completedAt, validityDays),
        progressStatus: PROGRESS_STATUS.COMPLETED,
        score: scoreHigh,
        passedAttempt: true,
      };
    }
    return {
      status: ASSIGNMENT_STATUS.EXPIRED,
      completedAt: null,
      dueAt: addDays(now, -(4 + Math.floor(rand() * 35))),
      progressStatus: rand() > 0.6 ? PROGRESS_STATUS.IN_PROGRESS : PROGRESS_STATUS.NOT_STARTED,
      score: rand() > 0.6 ? scoreMid : null,
      passedAttempt: false,
    };
  };

  switch (profile) {
    case "star":
      return ratio < 0.92 ? completedFar() : assignedFar(null, null);
    case "solid":
      return ratio < 0.72 ? completedFar() : assignedFar(null, null);
    case "in_progress":
      if (ratio < 0.28) return completedFar();
      if (ratio < 0.58) return assignedFar(PROGRESS_STATUS.IN_PROGRESS, scoreMid);
      return assignedFar(null, null);
    case "due_soon":
      if (ratio < 0.42) return dueSoonCompleted();
      if (ratio < 0.72) return dueSoonAssigned();
      return assignedFar(null, null);
    case "lapsed":
      if (ratio < 0.34) return completedFar();
      if (ratio < 0.66) return expired(true);
      return assignedFar(null, null);
    case "behind":
      if (ratio < 0.12) return completedFar();
      if (ratio < 0.58) return expired(false);
      return assignedFar(PROGRESS_STATUS.IN_PROGRESS, scoreMid);
    default:
      return assignedFar(null, null);
  }
}
