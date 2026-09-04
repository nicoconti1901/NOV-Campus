import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectProgressOptions,
  filterProgressRows,
  paginateProgressRows,
  parseProgressQuery,
  progressQueryHref,
  progressQueryIsEmpty,
  sortProgressRows,
  type ProgressQueryRow,
} from "./progress-query";

function row(partial: Partial<ProgressQueryRow> & Pick<ProgressQueryRow, "id" | "bucket">): ProgressQueryRow {
  return {
    dueAt: new Date("2026-06-01T12:00:00Z"),
    student: { dni: "32010001", firstName: "Ana", lastName: "Vega" },
    training: { title: "Conciencia Ambiental", room: { name: "Medio Ambiente", slug: "medio-ambiente" } },
    cell: {
      sede: { name: "TB AR CRV WELLCHEK" },
      puesto: { name: "Supervisor" },
      tarea: { name: "SUPERVISOR" },
    },
    ...partial,
  };
}

describe("progress-query", () => {
  const rows: ProgressQueryRow[] = [
    row({ id: "1", bucket: "expired", student: { dni: "32010001", firstName: "Ana", lastName: "Vega" } }),
    row({
      id: "2",
      bucket: "completed",
      student: { dni: "32020002", firstName: "Luis", lastName: "Moreno" },
      cell: {
        sede: { name: "TB AR HSE" },
        puesto: { name: "Inspector" },
        tarea: { name: "OPERADOR WCH" },
      },
      training: { title: "EPP", room: { name: "Seguridad e Higiene", slug: "seguridad-higiene" } },
    }),
    row({ id: "3", bucket: "due_soon", dueAt: new Date("2026-05-20T12:00:00Z") }),
    row({ id: "4", bucket: "pending", dueAt: new Date("2026-08-01T12:00:00Z") }),
  ];

  it("filters by any combination the manager can ask for", () => {
    assert.equal(filterProgressRows(rows, parseProgressQuery({ estado: "expired" })).length, 1);
    assert.equal(filterProgressRows(rows, parseProgressQuery({ sede: "TB AR HSE" }))[0]?.id, "2");
    assert.equal(filterProgressRows(rows, parseProgressQuery({ q: "32.010.001" }))[0]?.id, "1");
    assert.equal(filterProgressRows(rows, parseProgressQuery({ q: "moreno" }))[0]?.id, "2");
    assert.equal(filterProgressRows(rows, parseProgressQuery({ curso: "EPP", sala: "seguridad-higiene" })).length, 1);
    assert.equal(filterProgressRows(rows, parseProgressQuery({ puesto: "Supervisor", tarea: "SUPERVISOR" })).length, 3);
    assert.equal(filterProgressRows(rows, parseProgressQuery({ estado: "nope" })).length, 4);
  });

  it("sorts by risk then due date and paginates", () => {
    const sorted = sortProgressRows(rows);
    assert.deepEqual(
      sorted.map((item) => item.bucket),
      ["expired", "due_soon", "pending", "completed"]
    );
    const page = paginateProgressRows(sorted, 2, 2);
    assert.equal(page.page, 2);
    assert.equal(page.pageCount, 2);
    assert.equal(page.from, 3);
    assert.equal(page.to, 4);
    assert.equal(page.items.length, 2);
  });

  it("builds shareable query hrefs and option lists", () => {
    const query = parseProgressQuery({ sede: "TB AR HSE", estado: "completed" });
    assert.equal(progressQueryIsEmpty(query), false);
    assert.equal(progressQueryHref(query), "/capacitacion/admin/progreso?sede=TB+AR+HSE&estado=completed");
    assert.equal(progressQueryHref(query, 3).includes("page=3"), true);
    const options = collectProgressOptions(rows);
    assert.deepEqual(options.sedes, ["TB AR CRV WELLCHEK", "TB AR HSE"]);
    assert.equal(options.salas.some((sala) => sala.slug === "medio-ambiente"), true);
  });
});
