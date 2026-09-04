import { prisma } from "@/lib/prisma";
import { ASSIGNMENT_STATUS, MATRIX_STATUS, PROGRESS_STATUS } from "@/lib/capacitacion/constants";
import {
  MATRIX_CELLS,
  MATRIX_TOPICS,
} from "@/lib/capacitacion/matrix-catalog";
import {
  classifyAssignment,
  complianceRate,
  dueAtFromAssigned,
  dueAtFromCompleted,
  nextNoticeKind,
  sedeHealth,
  shouldMarkExpired,
  type AssignmentBucket,
} from "@/lib/capacitacion/matrix-engine";

type Db = typeof prisma;

export async function getPublishedMatrix(db: Db = prisma) {
  return db.annualMatrix.findFirst({
    where: { status: MATRIX_STATUS.PUBLISHED },
    orderBy: { year: "desc" },
  });
}

export async function listDirectory(db: Db = prisma) {
  const [sedes, puestos, tareas] = await Promise.all([
    db.sede.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.puesto.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    db.tarea.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return { sedes, puestos, tareas };
}

export async function studentHasAssignment(studentId: string, trainingId: string) {
  const assignment = await prisma.trainingAssignment.findFirst({
    where: {
      studentId,
      trainingId,
      training: { published: true },
    },
    include: { training: { select: { published: true } } },
  });
  return assignment;
}

export async function applyScopeToPublishedMatrix(input: {
  trainingId: string;
  sedeId: string;
  puestoId: string;
  tareaId: string;
  validityDays: number;
}) {
  if (!input.sedeId || !input.puestoId || !input.tareaId) {
    return { skipped: true as const, reason: "missing_scope" };
  }

  await prisma.trainingScope.upsert({
    where: {
      trainingId_sedeId_puestoId_tareaId: {
        trainingId: input.trainingId,
        sedeId: input.sedeId,
        puestoId: input.puestoId,
        tareaId: input.tareaId,
      },
    },
    update: { validityDays: input.validityDays },
    create: input,
  });

  const matrix = await getPublishedMatrix();
  if (!matrix) return { skipped: true as const, reason: "no_published_matrix" };

  const cell = await prisma.matrixCell.upsert({
    where: {
      matrixId_sedeId_puestoId_tareaId: {
        matrixId: matrix.id,
        sedeId: input.sedeId,
        puestoId: input.puestoId,
        tareaId: input.tareaId,
      },
    },
    update: {},
    create: {
      matrixId: matrix.id,
      sedeId: input.sedeId,
      puestoId: input.puestoId,
      tareaId: input.tareaId,
    },
  });

  await prisma.matrixCellItem.upsert({
    where: {
      cellId_trainingId: { cellId: cell.id, trainingId: input.trainingId },
    },
    update: { validityDays: input.validityDays },
    create: {
      cellId: cell.id,
      trainingId: input.trainingId,
      validityDays: input.validityDays,
    },
  });

  const students = await prisma.student.findMany({
    where: {
      profileCompleted: true,
      sedeId: input.sedeId,
      puestoId: input.puestoId,
      tareaId: input.tareaId,
    },
    select: { id: true },
  });

  for (const student of students) {
    await upsertAssignment({
      studentId: student.id,
      trainingId: input.trainingId,
      matrixId: matrix.id,
      cellId: cell.id,
      validityDays: input.validityDays,
    });
  }

  return { skipped: false as const, cellId: cell.id, impacted: students.length };
}

export async function syncStudentAssignments(studentId: string, now = new Date()) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, sedeId: true, puestoId: true, tareaId: true, profileCompleted: true },
  });
  if (!student?.profileCompleted || !student.sedeId || !student.puestoId || !student.tareaId) {
    return { synced: 0 };
  }

  const matrix = await getPublishedMatrix();
  if (!matrix) return { synced: 0 };

  const cell = await prisma.matrixCell.findUnique({
    where: {
      matrixId_sedeId_puestoId_tareaId: {
        matrixId: matrix.id,
        sedeId: student.sedeId,
        puestoId: student.puestoId,
        tareaId: student.tareaId,
      },
    },
    include: {
      items: {
        include: { training: { select: { id: true, published: true } } },
      },
    },
  });

  const requiredTrainingIds = new Set(
    (cell?.items ?? [])
      .filter((item) => item.training.published)
      .map((item) => item.trainingId)
  );

  const existing = await prisma.trainingAssignment.findMany({
    where: { studentId, matrixId: matrix.id },
  });

  const toDelete = existing
    .filter((assignment) => !requiredTrainingIds.has(assignment.trainingId))
    .map((assignment) => assignment.id);

  if (!cell) {
    if (toDelete.length > 0) {
      await prisma.trainingAssignment.deleteMany({ where: { id: { in: toDelete } } });
    }
    return { synced: 0 };
  }

  const existingByTraining = new Map(existing.map((row) => [row.trainingId, row]));
  const toCreate: Array<{
    studentId: string;
    trainingId: string;
    matrixId: string;
    cellId: string;
    validityDays: number;
    status: string;
    assignedAt: Date;
    dueAt: Date;
  }> = [];
  const toUpdate: Array<{ id: string; cellId: string; validityDays: number; dueAt: Date }> = [];

  for (const item of cell.items) {
    if (!item.training.published) continue;
    const current = existingByTraining.get(item.trainingId);
    if (!current) {
      toCreate.push({
        studentId,
        trainingId: item.trainingId,
        matrixId: matrix.id,
        cellId: cell.id,
        validityDays: item.validityDays,
        status: ASSIGNMENT_STATUS.ASSIGNED,
        assignedAt: now,
        dueAt: dueAtFromAssigned(now, item.validityDays),
      });
      continue;
    }

    const cellChanged = current.cellId !== cell.id;
    const validityChanged = current.validityDays !== item.validityDays;
    if (!cellChanged && !validityChanged) continue;

    toUpdate.push({
      id: current.id,
      cellId: cell.id,
      validityDays: item.validityDays,
      dueAt:
        current.status === ASSIGNMENT_STATUS.COMPLETED && current.completedAt
          ? dueAtFromCompleted(current.completedAt, item.validityDays)
          : current.dueAt,
    });
  }

  if (toDelete.length > 0 || toCreate.length > 0 || toUpdate.length > 0) {
    await prisma.$transaction([
      ...(toDelete.length > 0
        ? [prisma.trainingAssignment.deleteMany({ where: { id: { in: toDelete } } })]
        : []),
      ...(toCreate.length > 0 ? [prisma.trainingAssignment.createMany({ data: toCreate })] : []),
      ...toUpdate.map((row) =>
        prisma.trainingAssignment.update({
          where: { id: row.id },
          data: {
            cellId: row.cellId,
            validityDays: row.validityDays,
            dueAt: row.dueAt,
          },
        })
      ),
    ]);
  }

  return { synced: toCreate.length + toUpdate.length };
}

export async function ensureCatalogCellsOnPublishedMatrix() {
  const matrix = await getPublishedMatrix();
  if (!matrix) return { created: 0, syncedStudents: 0 };

  const existingCount = await prisma.matrixCell.count({ where: { matrixId: matrix.id } });
  if (existingCount >= MATRIX_CELLS.length) {
    return { created: 0, syncedStudents: 0 };
  }

  const [sedes, puestos, tareas, trainings] = await Promise.all([
    prisma.sede.findMany({ select: { id: true, code: true } }),
    prisma.puesto.findMany({ select: { id: true, code: true } }),
    prisma.tarea.findMany({ select: { id: true, code: true } }),
    prisma.training.findMany({ select: { id: true, code: true } }),
  ]);

  const sedeByCode = new Map(sedes.map((item) => [item.code, item.id]));
  const puestoByCode = new Map(puestos.map((item) => [item.code, item.id]));
  const tareaByCode = new Map(tareas.map((item) => [item.code, item.id]));
  const trainingByCode = new Map(
    trainings.filter((item) => item.code).map((item) => [item.code as string, item.id])
  );

  let created = 0;

  for (const def of MATRIX_CELLS) {
    const sedeId = sedeByCode.get(def.sedeCode);
    const puestoId = puestoByCode.get(def.puestoCode);
    const tareaId = tareaByCode.get(def.tareaCode);
    if (!sedeId || !puestoId || !tareaId) continue;

    const cell = await prisma.matrixCell.upsert({
      where: {
        matrixId_sedeId_puestoId_tareaId: { matrixId: matrix.id, sedeId, puestoId, tareaId },
      },
      update: {},
      create: { matrixId: matrix.id, sedeId, puestoId, tareaId },
    });
    created += 1;

    for (const topicCode of def.topicCodes) {
      const trainingId = trainingByCode.get(topicCode);
      const topic = MATRIX_TOPICS.find((item) => item.code === topicCode);
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

  const students = await prisma.student.findMany({
    where: { profileCompleted: true },
    select: { id: true },
  });
  for (const student of students) {
    await syncStudentAssignments(student.id);
  }

  return { created, syncedStudents: students.length };
}

async function upsertAssignment(input: {
  studentId: string;
  trainingId: string;
  matrixId: string;
  cellId: string;
  validityDays: number;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const existing = await prisma.trainingAssignment.findUnique({
    where: {
      studentId_trainingId_matrixId: {
        studentId: input.studentId,
        trainingId: input.trainingId,
        matrixId: input.matrixId,
      },
    },
  });

  if (!existing) {
    await prisma.trainingAssignment.create({
      data: {
        studentId: input.studentId,
        trainingId: input.trainingId,
        matrixId: input.matrixId,
        cellId: input.cellId,
        validityDays: input.validityDays,
        status: ASSIGNMENT_STATUS.ASSIGNED,
        assignedAt: now,
        dueAt: dueAtFromAssigned(now, input.validityDays),
      },
    });
    return;
  }

  await prisma.trainingAssignment.update({
    where: { id: existing.id },
    data: {
      cellId: input.cellId,
      validityDays: input.validityDays,
      dueAt:
        existing.status === ASSIGNMENT_STATUS.COMPLETED && existing.completedAt
          ? dueAtFromCompleted(existing.completedAt, input.validityDays)
          : existing.dueAt,
    },
  });
}

export async function completeAssignment(studentId: string, trainingId: string, now = new Date()) {
  const assignment = await prisma.trainingAssignment.findFirst({
    where: { studentId, trainingId },
    orderBy: { assignedAt: "desc" },
  });
  if (!assignment) return null;

  return prisma.trainingAssignment.update({
    where: { id: assignment.id },
    data: {
      status: ASSIGNMENT_STATUS.COMPLETED,
      completedAt: now,
      dueAt: dueAtFromCompleted(now, assignment.validityDays),
    },
  });
}

export async function scanAssignmentExpiries(now = new Date(), studentId?: string) {
  const open = await prisma.trainingAssignment.findMany({
    where: {
      status: { not: ASSIGNMENT_STATUS.EXPIRED },
      ...(studentId ? { studentId } : {}),
    },
  });

  type ExpiryPatch = {
    status?: string;
    notice30At?: Date;
    notice7At?: Date;
    notice1At?: Date;
    noticeExpiredAt?: Date;
  };

  const groups = new Map<string, { ids: string[]; data: ExpiryPatch }>();
  let expired = 0;
  let notices = 0;

  for (const assignment of open) {
    const data: ExpiryPatch = {};

    if (shouldMarkExpired(assignment, now)) {
      data.status = ASSIGNMENT_STATUS.EXPIRED;
      expired += 1;
    }

    const notice = nextNoticeKind(assignment, now);
    if (notice === 30) data.notice30At = now;
    if (notice === 7) data.notice7At = now;
    if (notice === 1) data.notice1At = now;
    if (notice === "expired") data.noticeExpiredAt = now;
    if (notice) notices += 1;

    const keys = Object.keys(data);
    if (keys.length === 0) continue;

    const groupKey = [
      data.status ?? "",
      data.notice30At ? "30" : "",
      data.notice7At ? "7" : "",
      data.notice1At ? "1" : "",
      data.noticeExpiredAt ? "e" : "",
    ].join("|");
    const group = groups.get(groupKey) ?? { ids: [], data };
    group.ids.push(assignment.id);
    groups.set(groupKey, group);
  }

  if (groups.size > 0) {
    await prisma.$transaction(
      [...groups.values()].map((group) =>
        prisma.trainingAssignment.updateMany({
          where: { id: { in: group.ids } },
          data: group.data,
        })
      )
    );
  }

  return { expired, notices, scanned: open.length };
}

export type StudentAssignmentView = {
  id: string;
  trainingId: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  room: { name: string; slug: string };
  status: string;
  bucket: AssignmentBucket;
  dueAt: Date;
  completedAt: Date | null;
  score: number | null;
  progressStatus: string | null;
  validityDays: number;
};

export async function getStudentAssignmentViews(
  studentId: string,
  now = new Date()
): Promise<StudentAssignmentView[]> {
  await scanAssignmentExpiries(now, studentId);

  const assignments = await prisma.trainingAssignment.findMany({
    where: { studentId, training: { published: true } },
    include: {
      training: {
        include: {
          room: { select: { name: true, slug: true } },
          progress: { where: { studentId }, take: 1 },
        },
      },
    },
    orderBy: { dueAt: "asc" },
  });

  return assignments.map((assignment) => {
    const progress = assignment.training.progress[0];
    const bucket = classifyAssignment(assignment, now);
    return {
      id: assignment.id,
      trainingId: assignment.trainingId,
      title: assignment.training.title,
      description: assignment.training.description,
      coverImage: assignment.training.coverImage,
      room: assignment.training.room,
      status: assignment.status,
      bucket,
      dueAt: assignment.dueAt,
      completedAt: assignment.completedAt,
      score: progress?.score ?? null,
      progressStatus: progress?.status ?? PROGRESS_STATUS.NOT_STARTED,
      validityDays: assignment.validityDays,
    };
  });
}

export function summarizeAssignments(items: StudentAssignmentView[]) {
  return {
    pending: items.filter((i) => i.bucket === "pending").length,
    dueSoon: items.filter((i) => i.bucket === "due_soon").length,
    expired: items.filter((i) => i.bucket === "expired").length,
    completed: items.filter((i) => i.bucket === "completed").length,
    total: items.length,
  };
}

export type SedeProgressRow = {
  sedeId: string;
  sedeCode: string;
  sede: string;
  assigned: number;
  completed: number;
  expired: number;
  dueSoon: number;
  pending: number;
  people: number;
  cells: number;
  complianceRate: number | null;
};

export async function getProgressKpis() {
  await scanAssignmentExpiries();

  const [sedes, assignments, published] = await Promise.all([
    prisma.sede.findMany({ orderBy: { name: "asc" } }),
    prisma.trainingAssignment.findMany({
      include: {
        student: {
          select: {
            dni: true,
            firstName: true,
            lastName: true,
            sede: { select: { name: true } },
          },
        },
        training: {
          select: { title: true, room: { select: { name: true, slug: true } } },
        },
        cell: {
          include: {
            sede: { select: { id: true, code: true, name: true } },
            puesto: { select: { name: true } },
            tarea: { select: { name: true } },
          },
        },
      },
    }),
    prisma.annualMatrix.findFirst({
      where: { status: MATRIX_STATUS.PUBLISHED },
      orderBy: { year: "desc" },
      select: { id: true, year: true },
    }),
  ]);

  const [cellCounts, peopleCounts] = await Promise.all([
    published
      ? prisma.matrixCell.groupBy({
          by: ["sedeId"],
          where: { matrixId: published.id },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    prisma.student.groupBy({
      by: ["sedeId"],
      where: { profileCompleted: true, sedeId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const cellsBySede = new Map(cellCounts.map((row) => [row.sedeId, row._count._all]));
  const peopleBySede = new Map(
    peopleCounts
      .filter((row): row is typeof row & { sedeId: string } => row.sedeId != null)
      .map((row) => [row.sedeId, row._count._all])
  );

  const now = new Date();
  const classified = assignments.map((row) => ({
    ...row,
    bucket: classifyAssignment(row, now),
  }));

  const bySede = new Map<string, SedeProgressRow>();
  for (const sede of sedes) {
    bySede.set(sede.id, {
      sedeId: sede.id,
      sedeCode: sede.code,
      sede: sede.name,
      assigned: 0,
      completed: 0,
      expired: 0,
      dueSoon: 0,
      pending: 0,
      people: peopleBySede.get(sede.id) ?? 0,
      cells: cellsBySede.get(sede.id) ?? 0,
      complianceRate: null,
    });
  }

  for (const row of classified) {
    const current = bySede.get(row.cell.sede.id);
    if (!current) continue;
    current.assigned += 1;
    if (row.bucket === "completed") current.completed += 1;
    if (row.bucket === "expired") current.expired += 1;
    if (row.bucket === "due_soon") current.dueSoon += 1;
    if (row.bucket === "pending") current.pending += 1;
  }

  const sedeRows = [...bySede.values()].map((row) => ({
    ...row,
    complianceRate: complianceRate(row.assigned, row.completed),
  }));

  const assigned = classified.length;
  const completed = classified.filter((r) => r.bucket === "completed").length;
  const expired = classified.filter((r) => r.bucket === "expired").length;
  const dueSoon = classified.filter((r) => r.bucket === "due_soon").length;
  const pending = classified.filter((r) => r.bucket === "pending").length;

  return {
    year: published?.year ?? null,
    assigned,
    completed,
    expired,
    dueSoon,
    pending,
    complianceRate: complianceRate(assigned, completed),
    sedesTotal: sedeRows.length,
    sedesCovered: sedeRows.filter((row) => row.assigned > 0).length,
    sedesAtRisk: sedeRows.filter((row) => sedeHealth(row) === "critical" || sedeHealth(row) === "watch").length,
    bySede: sedeRows.sort((a, b) => a.sede.localeCompare(b.sede, "es")),
    rows: classified,
  };
}
