import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ASSIGNMENT_STATUS, PROGRESS_STATUS } from "./constants";
import {
  DEMO_STUDENTS_PER_SEDE,
  buildDemoRoster,
  bulkDemoDni,
  expandProfileMix,
  resolveDemoAssignment,
} from "./demo-roster";
import { MATRIX_SEDES } from "./matrix-catalog";
import { classifyAssignment, findCellDefinition } from "./matrix-engine";

describe("demo-roster", () => {
  it("builds 40 unique students per sede with a valid matrix cell", () => {
    const roster = buildDemoRoster();
    assert.equal(roster.length, MATRIX_SEDES.length * DEMO_STUDENTS_PER_SEDE);

    const dnis = new Set(roster.map((person) => person.dni));
    assert.equal(dnis.size, roster.length);

    for (const sede of MATRIX_SEDES) {
      const inSede = roster.filter((person) => person.sedeCode === sede.code);
      assert.equal(inSede.length, DEMO_STUDENTS_PER_SEDE);
    }

    for (const person of roster) {
      const cell = findCellDefinition(person.sedeCode, person.puestoCode, person.tareaCode);
      assert.ok(cell, `no cell for ${person.dni}`);
      assert.match(person.dni, /^32\d{6}$/);
      assert.match(person.email, /@lote\.demo\.nov$/);
    }
  });

  it("keeps sede mixes sized to 40 and varies assignment buckets", () => {
    const mix = expandProfileMix({ star: 32, solid: 8 });
    assert.equal(mix.length, 40);
    assert.equal(mix.filter((profile) => profile === "star").length, 32);

    const now = new Date("2026-06-01T12:00:00Z");
    const star = resolveDemoAssignment("star", 0, 10, 365, now, 1);
    assert.equal(star.status, ASSIGNMENT_STATUS.COMPLETED);
    assert.equal(classifyAssignment(star, now), "completed");

    const dueSoon = resolveDemoAssignment("due_soon", 0, 10, 365, now, 2);
    assert.equal(classifyAssignment(dueSoon, now), "due_soon");

    const expired = resolveDemoAssignment("behind", 3, 10, 365, now, 3);
    assert.equal(expired.status, ASSIGNMENT_STATUS.EXPIRED);
    assert.equal(classifyAssignment(expired, now), "expired");

    const inProgress = resolveDemoAssignment("in_progress", 4, 10, 365, now, 4);
    assert.equal(inProgress.status, ASSIGNMENT_STATUS.ASSIGNED);
    assert.equal(inProgress.progressStatus, PROGRESS_STATUS.IN_PROGRESS);
    assert.equal(classifyAssignment(inProgress, now), "pending");

    assert.equal(bulkDemoDni(0, 0), "32010001");
    assert.equal(bulkDemoDni(7, 39), "32080040");
  });
});
