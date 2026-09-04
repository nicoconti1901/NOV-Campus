import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ADMIN_ROLE, ASSIGNMENT_STATUS, MATRIX_STATUS, PROGRESS_STATUS, ROOMS } from "../src/lib/capacitacion/constants";
import {
  MATRIX_CELLS,
  MATRIX_DEMO_STUDENTS,
  MATRIX_PUESTOS,
  MATRIX_SEDES,
  MATRIX_TAREAS,
  MATRIX_TOPICS,
  MATRIX_YEAR,
} from "../src/lib/capacitacion/matrix-catalog";
import {
  DEMO_BULK_DNI_PREFIX,
  DEMO_STUDENTS_PER_SEDE,
  buildDemoRoster,
  resolveDemoAssignment,
} from "../src/lib/capacitacion/demo-roster";
import { addDays } from "../src/lib/capacitacion/matrix-engine";

const prisma = new PrismaClient();

const DEMO_QUESTIONS = [
  {
    text: "¿Cuál es el objetivo de esta capacitación obligatoria?",
    options: [
      { text: "Aplicar el procedimiento HSE correspondiente en el puesto y la sede", isCorrect: true },
      { text: "Reemplazar los controles de ingeniería del sitio", isCorrect: false },
      { text: "Evitar el reporte de desvíos", isCorrect: false },
    ],
  },
  {
    text: "Si la vigencia de la competencia está vencida, el participante debe:",
    options: [
      { text: "Recursar y aprobar antes de continuar la tarea", isCorrect: true },
      { text: "Esperar a la próxima auditoría externa", isCorrect: false },
      { text: "Continuar operando sin registro", isCorrect: false },
    ],
  },
];

async function upsertMasters() {
  for (const item of MATRIX_SEDES) {
    await prisma.sede.upsert({
      where: { code: item.code },
      update: { name: item.name, active: true },
      create: item,
    });
  }
  for (const item of MATRIX_PUESTOS) {
    await prisma.puesto.upsert({
      where: { code: item.code },
      update: { name: item.name, active: true },
      create: item,
    });
  }
  for (const item of MATRIX_TAREAS) {
    await prisma.tarea.upsert({
      where: { code: item.code },
      update: { name: item.name, active: true },
      create: item,
    });
  }
}

async function upsertTrainings(roomBySlug: Map<string, string>) {
  const byCode = new Map<string, string>();

  for (const topic of MATRIX_TOPICS) {
    const roomId = roomBySlug.get(topic.roomSlug);
    if (!roomId) continue;

    const description =
      `Capacitación obligatoria de la matriz HSE ${MATRIX_YEAR}. ${topic.justificacion}. ` +
      `Vigencia: ${topic.validityDays} días. Contenido demostrativo para el campus.`;

    const existing = await prisma.training.findUnique({ where: { code: topic.code } });
    if (existing) {
      await prisma.training.update({
        where: { id: existing.id },
        data: {
          title: topic.title,
          description,
          roomId,
          published: true,
          validityDays: topic.validityDays,
          minPassScore: 70,
        },
      });
      byCode.set(topic.code, existing.id);
      continue;
    }

    const created = await prisma.training.create({
      data: {
        code: topic.code,
        title: topic.title,
        description,
        roomId,
        published: true,
        validityDays: topic.validityDays,
        minPassScore: 70,
        questions: {
          create: DEMO_QUESTIONS.map((q, qi) => ({
            text: q.text,
            sortOrder: qi,
            options: { create: q.options },
          })),
        },
      },
    });
    byCode.set(topic.code, created.id);
  }

  return byCode;
}

async function publishMatrix(
  trainingByCode: Map<string, string>,
  sedeByCode: Map<string, string>,
  puestoByCode: Map<string, string>,
  tareaByCode: Map<string, string>
) {
  const matrix = await prisma.annualMatrix.upsert({
    where: { year: MATRIX_YEAR },
    update: { status: MATRIX_STATUS.PUBLISHED, publishedAt: new Date() },
    create: {
      year: MATRIX_YEAR,
      status: MATRIX_STATUS.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  for (const def of MATRIX_CELLS) {
    const sedeId = sedeByCode.get(def.sedeCode);
    const puestoId = puestoByCode.get(def.puestoCode);
    const tareaId = tareaByCode.get(def.tareaCode);
    if (!sedeId || !puestoId || !tareaId) continue;

    const cell = await prisma.matrixCell.upsert({
      where: {
        matrixId_sedeId_puestoId_tareaId: {
          matrixId: matrix.id,
          sedeId,
          puestoId,
          tareaId,
        },
      },
      update: {},
      create: { matrixId: matrix.id, sedeId, puestoId, tareaId },
    });

    for (const topicCode of def.topicCodes) {
      const trainingId = trainingByCode.get(topicCode);
      const topic = MATRIX_TOPICS.find((t) => t.code === topicCode);
      if (!trainingId || !topic) continue;

      await prisma.trainingScope.upsert({
        where: {
          trainingId_sedeId_puestoId_tareaId: { trainingId, sedeId, puestoId, tareaId },
        },
        update: { validityDays: topic.validityDays },
        create: { trainingId, sedeId, puestoId, tareaId, validityDays: topic.validityDays },
      });

      await prisma.matrixCellItem.upsert({
        where: { cellId_trainingId: { cellId: cell.id, trainingId } },
        update: { validityDays: topic.validityDays },
        create: { cellId: cell.id, trainingId, validityDays: topic.validityDays },
      });
    }
  }

  return matrix;
}

async function seedDemoPeople(
  matrixId: string,
  sedeByCode: Map<string, string>,
  puestoByCode: Map<string, string>,
  tareaByCode: Map<string, string>
) {
  const now = new Date();

  await prisma.allowedDni.upsert({
    where: { dni: "30111555" },
    update: { enabled: true },
    create: { dni: "30111555", enabled: true },
  });

  for (const demo of MATRIX_DEMO_STUDENTS) {
    await prisma.allowedDni.upsert({
      where: { dni: demo.dni },
      update: { enabled: true },
      create: { dni: demo.dni, enabled: true },
    });

    const sedeId = sedeByCode.get(demo.sedeCode);
    const puestoId = puestoByCode.get(demo.puestoCode);
    const tareaId = tareaByCode.get(demo.tareaCode);
    if (!sedeId || !puestoId || !tareaId) continue;

    const student = await prisma.student.upsert({
      where: { dni: demo.dni },
      update: {
        firstName: demo.firstName,
        lastName: demo.lastName,
        email: demo.email,
        company: "NOV EPS",
        sedeId,
        puestoId,
        tareaId,
        profileCompleted: true,
      },
      create: {
        dni: demo.dni,
        firstName: demo.firstName,
        lastName: demo.lastName,
        email: demo.email,
        company: "NOV EPS",
        sedeId,
        puestoId,
        tareaId,
        profileCompleted: true,
      },
    });

    const cell = await prisma.matrixCell.findUnique({
      where: {
        matrixId_sedeId_puestoId_tareaId: { matrixId, sedeId, puestoId, tareaId },
      },
      include: { items: { include: { training: true } } },
    });
    if (!cell) continue;

    const publishedItems = cell.items.filter((item) => item.training.published);
    for (const [index, item] of publishedItems.entries()) {
      let status: string = ASSIGNMENT_STATUS.ASSIGNED;
      let dueAt = addDays(now, item.validityDays);
      let completedAt: Date | null = null;

      if (demo.dni === "30111222") {
        if (index < 3) {
          status = ASSIGNMENT_STATUS.COMPLETED;
          completedAt = addDays(now, -40);
          dueAt = addDays(completedAt, item.validityDays);
        } else if (index < 5) {
          status = ASSIGNMENT_STATUS.EXPIRED;
          dueAt = addDays(now, -20);
        } else if (index < 7) {
          dueAt = addDays(now, 12);
        }
      } else if (demo.dni === "30111333" && index === 0) {
        status = ASSIGNMENT_STATUS.COMPLETED;
        completedAt = addDays(now, -15);
        dueAt = addDays(completedAt, item.validityDays);
      } else if (demo.dni === "30111444" && index < 2) {
        status = ASSIGNMENT_STATUS.EXPIRED;
        dueAt = addDays(now, -8);
      }

      await prisma.trainingAssignment.upsert({
        where: {
          studentId_trainingId_matrixId: {
            studentId: student.id,
            trainingId: item.trainingId,
            matrixId,
          },
        },
        update: { status, dueAt, completedAt, cellId: cell.id, validityDays: item.validityDays },
        create: {
          studentId: student.id,
          trainingId: item.trainingId,
          matrixId,
          cellId: cell.id,
          status,
          validityDays: item.validityDays,
          dueAt,
          completedAt,
        },
      });

      if (status === ASSIGNMENT_STATUS.COMPLETED) {
        await prisma.trainingProgress.upsert({
          where: {
            studentId_trainingId: { studentId: student.id, trainingId: item.trainingId },
          },
          update: { status: "completed", score: 90, completedAt: completedAt ?? now },
          create: {
            studentId: student.id,
            trainingId: item.trainingId,
            status: "completed",
            score: 90,
            completedAt: completedAt ?? now,
          },
        });
      }
    }
  }
}

async function createManyInChunks<T extends object>(
  createMany: (args: { data: T[] }) => Promise<unknown>,
  rows: T[],
  chunkSize = 80
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    await createMany({ data: rows.slice(i, i + chunkSize) });
  }
}

async function seedBulkPeople(
  matrixId: string,
  sedeByCode: Map<string, string>,
  puestoByCode: Map<string, string>,
  tareaByCode: Map<string, string>
) {
  const now = new Date();
  const roster = buildDemoRoster();

  await prisma.student.deleteMany({ where: { dni: { startsWith: DEMO_BULK_DNI_PREFIX } } });
  await prisma.allowedDni.deleteMany({ where: { dni: { startsWith: DEMO_BULK_DNI_PREFIX } } });

  await createManyInChunks(
    (args) => prisma.allowedDni.createMany(args),
    roster.map((person) => ({ dni: person.dni, enabled: true }))
  );

  await createManyInChunks(
    (args) => prisma.student.createMany(args),
    roster.flatMap((person) => {
      const sedeId = sedeByCode.get(person.sedeCode);
      const puestoId = puestoByCode.get(person.puestoCode);
      const tareaId = tareaByCode.get(person.tareaCode);
      if (!sedeId || !puestoId || !tareaId) return [];
      return [
        {
          dni: person.dni,
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          phone: person.phone,
          company: "NOV EPS",
          sedeId,
          puestoId,
          tareaId,
          profileCompleted: true,
        },
      ];
    })
  );

  const students = await prisma.student.findMany({
    where: { dni: { startsWith: DEMO_BULK_DNI_PREFIX } },
    select: { id: true, dni: true },
  });
  const studentByDni = new Map(students.map((student) => [student.dni, student.id]));

  const cells = await prisma.matrixCell.findMany({
    where: { matrixId },
    include: { items: { include: { training: { select: { id: true, published: true } } } } },
  });
  const cellByKey = new Map(
    cells.map((cell) => [`${cell.sedeId}::${cell.puestoId}::${cell.tareaId}`, cell])
  );

  const assignments: {
    studentId: string;
    trainingId: string;
    matrixId: string;
    cellId: string;
    status: string;
    validityDays: number;
    dueAt: Date;
    completedAt: Date | null;
  }[] = [];
  const progressRows: {
    studentId: string;
    trainingId: string;
    status: string;
    score: number | null;
    completedAt: Date | null;
  }[] = [];
  const attempts: {
    studentId: string;
    trainingId: string;
    score: number;
    passed: boolean;
    answers: string;
    attemptedAt: Date;
  }[] = [];

  for (const [personIndex, person] of roster.entries()) {
    const studentId = studentByDni.get(person.dni);
    const sedeId = sedeByCode.get(person.sedeCode);
    const puestoId = puestoByCode.get(person.puestoCode);
    const tareaId = tareaByCode.get(person.tareaCode);
    if (!studentId || !sedeId || !puestoId || !tareaId) continue;

    const cell = cellByKey.get(`${sedeId}::${puestoId}::${tareaId}`);
    if (!cell) continue;

    const publishedItems = cell.items.filter((item) => item.training.published);
    for (const [index, item] of publishedItems.entries()) {
      const outcome = resolveDemoAssignment(
        person.profile,
        index,
        publishedItems.length,
        item.validityDays,
        now,
        personIndex * 97
      );

      assignments.push({
        studentId,
        trainingId: item.trainingId,
        matrixId,
        cellId: cell.id,
        status: outcome.status,
        validityDays: item.validityDays,
        dueAt: outcome.dueAt,
        completedAt: outcome.completedAt,
      });

      if (outcome.progressStatus) {
        progressRows.push({
          studentId,
          trainingId: item.trainingId,
          status: outcome.progressStatus,
          score: outcome.score,
          completedAt: outcome.progressStatus === PROGRESS_STATUS.COMPLETED ? outcome.completedAt : null,
        });
      }

      if (outcome.passedAttempt && outcome.score != null) {
        attempts.push({
          studentId,
          trainingId: item.trainingId,
          score: outcome.score,
          passed: true,
          answers: "{}",
          attemptedAt: outcome.completedAt ?? now,
        });
      }
    }
  }

  await createManyInChunks((args) => prisma.trainingAssignment.createMany(args), assignments);
  await createManyInChunks((args) => prisma.trainingProgress.createMany(args), progressRows);
  await createManyInChunks((args) => prisma.quizAttempt.createMany(args), attempts);
}

async function main() {
  for (const room of ROOMS) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: { name: room.name },
      create: room,
    });
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@casinoclub.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, role: ADMIN_ROLE.TRAINER },
    create: { email, passwordHash, role: ADMIN_ROLE.TRAINER },
  });

  const companyEmail = process.env.COMPANY_EMAIL ?? "empresa@nov.com";
  const companyPassword = process.env.COMPANY_PASSWORD ?? "Empresa123!";
  const companyPasswordHash = await bcrypt.hash(companyPassword, 12);

  await prisma.admin.upsert({
    where: { email: companyEmail },
    update: { passwordHash: companyPasswordHash, role: ADMIN_ROLE.COMPANY },
    create: { email: companyEmail, passwordHash: companyPasswordHash, role: ADMIN_ROLE.COMPANY },
  });

  await upsertMasters();

  const rooms = await prisma.room.findMany();
  const roomBySlug = new Map(rooms.map((r) => [r.slug, r.id]));
  const trainingByCode = await upsertTrainings(roomBySlug);

  const [sedes, puestos, tareas] = await Promise.all([
    prisma.sede.findMany(),
    prisma.puesto.findMany(),
    prisma.tarea.findMany(),
  ]);
  const sedeByCode = new Map(sedes.map((s) => [s.code, s.id]));
  const puestoByCode = new Map(puestos.map((s) => [s.code, s.id]));
  const tareaByCode = new Map(tareas.map((s) => [s.code, s.id]));

  const matrix = await publishMatrix(trainingByCode, sedeByCode, puestoByCode, tareaByCode);
  await seedDemoPeople(matrix.id, sedeByCode, puestoByCode, tareaByCode);
  await seedBulkPeople(matrix.id, sedeByCode, puestoByCode, tareaByCode);

  console.log("Seed completado. Salas, matriz HSE 2026 y cuentas de staff inicializadas.");
  console.log(`Capacitador: ${email}`);
  console.log(`Representante (solo progreso): ${companyEmail}`);
  console.log("Alumnos demo: 30111222 (Ana Vega), 30111333 (Luis Moreno), 30111444 (Marta Ruiz).");
  console.log("DNI sin perfil (para probar terna): 30111555");
  console.log(
    `Lote de simulacion: ${DEMO_STUDENTS_PER_SEDE} alumnos por sede (${MATRIX_SEDES.length} sedes, DNI 32xxxxxx).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
