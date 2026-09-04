import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  assignmentHeadline,
  cellKey,
  classifyAssignment,
  complianceRate,
  daysUntil,
  findCellDefinition,
  nextNoticeKind,
  rankSedesByRisk,
  sedeHealth,
  shortSedeName,
  shouldMarkExpired,
} from "./matrix-engine";
import { ASSIGNMENT_STATUS } from "./constants";
import { MATRIX_CELLS, MATRIX_DEMO_STUDENTS, MATRIX_TOPICS } from "./matrix-catalog";

describe("matrix-engine", () => {
  it("classifies pending, due soon, completed and expired", () => {
    const now = new Date("2026-06-01T12:00:00Z");
    assert.equal(
      classifyAssignment(
        { status: ASSIGNMENT_STATUS.ASSIGNED, dueAt: addDays(now, 90), completedAt: null },
        now
      ),
      "pending"
    );
    assert.equal(
      classifyAssignment(
        { status: ASSIGNMENT_STATUS.ASSIGNED, dueAt: addDays(now, 10), completedAt: null },
        now
      ),
      "due_soon"
    );
    assert.equal(
      classifyAssignment(
        {
          status: ASSIGNMENT_STATUS.COMPLETED,
          dueAt: addDays(now, 200),
          completedAt: addDays(now, -10),
        },
        now
      ),
      "completed"
    );
    assert.equal(
      classifyAssignment(
        { status: ASSIGNMENT_STATUS.COMPLETED, dueAt: addDays(now, -1), completedAt: addDays(now, -400) },
        now
      ),
      "expired"
    );
  });

  it("marks expired only after due date", () => {
    const now = new Date("2026-06-01T12:00:00Z");
    assert.equal(
      shouldMarkExpired(
        { status: ASSIGNMENT_STATUS.ASSIGNED, dueAt: addDays(now, 1), completedAt: null },
        now
      ),
      false
    );
    assert.equal(
      shouldMarkExpired(
        { status: ASSIGNMENT_STATUS.ASSIGNED, dueAt: addDays(now, -1), completedAt: null },
        now
      ),
      true
    );
  });

  it("emits 30/7/1/expired notices once", () => {
    const now = new Date("2026-06-01T12:00:00Z");
    const base = {
      notice30At: null as Date | null,
      notice7At: null as Date | null,
      notice1At: null as Date | null,
      noticeExpiredAt: null as Date | null,
    };
    assert.equal(nextNoticeKind({ ...base, dueAt: addDays(now, 20) }, now), 30);
    assert.equal(
      nextNoticeKind({ ...base, dueAt: addDays(now, 20), notice30At: now }, now),
      null
    );
    assert.equal(nextNoticeKind({ ...base, dueAt: addDays(now, 5) }, now), 7);
    assert.equal(nextNoticeKind({ ...base, dueAt: addDays(now, 1) }, now), 1);
    assert.equal(nextNoticeKind({ ...base, dueAt: addDays(now, -1) }, now), "expired");
    assert.equal(daysUntil(addDays(now, 3), now), 3);
  });

  it("resolves WELLCHEK supervisor cell with assigned topics only", () => {
    const cell = findCellDefinition("tb-ar-crv-wellchek", "supervisor", "supervisor");
    assert.ok(cell);
    assert.ok(cell.topicCodes.includes("responsabilidades-del-supervisor"));
    assert.ok(cell.topicCodes.includes("investigacion-de-incidentes-hse-supervisores"));
    const topicCodes = new Set(MATRIX_TOPICS.map((t) => t.code));
    for (const code of cell.topicCodes) {
      assert.ok(topicCodes.has(code), `missing topic ${code}`);
    }
    assert.ok(MATRIX_TOPICS.every((t) => t.validityDays > 0));
    assert.ok(MATRIX_CELLS.length > 0);
    assert.equal(cellKey("s", "p", "t"), "s::p::t");
    assert.equal(assignmentHeadline("expired"), "Vencida");
  });

  it("ranks sede health for the executive dashboard", () => {
    assert.equal(complianceRate(0, 0), null);
    assert.equal(complianceRate(10, 7), 70);
    assert.equal(sedeHealth({ assigned: 0, expired: 0, dueSoon: 0 }), "empty");
    assert.equal(sedeHealth({ assigned: 4, expired: 1, dueSoon: 0 }), "critical");
    assert.equal(sedeHealth({ assigned: 4, expired: 0, dueSoon: 2 }), "watch");
    assert.equal(sedeHealth({ assigned: 4, expired: 0, dueSoon: 0 }), "on_track");
    assert.equal(shortSedeName("TB AR CRV WELLCHEK"), "WELLCHEK");
    const ranked = rankSedesByRisk([
      { sede: "B", assigned: 3, completed: 3, expired: 0, dueSoon: 0, pending: 0 },
      { sede: "A", assigned: 5, completed: 2, expired: 2, dueSoon: 1, pending: 0 },
      { sede: "C", assigned: 0, completed: 0, expired: 0, dueSoon: 0, pending: 0 },
    ]);
    assert.deepEqual(
      ranked.map((row) => row.sede),
      ["A", "C", "B"]
    );
  });

  it("demo students map to existing cells", () => {
    for (const student of MATRIX_DEMO_STUDENTS) {
      const cell = findCellDefinition(student.sedeCode, student.puestoCode, student.tareaCode);
      assert.ok(
        cell,
        `no cell for ${student.dni} ${student.puestoCode} x ${student.tareaCode}`
      );
      assert.ok(cell.topicCodes.length > 0);
    }
  });
});
