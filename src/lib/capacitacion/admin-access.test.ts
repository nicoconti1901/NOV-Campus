import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ADMIN_ROLE } from "./constants";
import {
  COMPANY_LOGIN,
  PROGRESS_HOME,
  TRAINER_HOME,
  TRAINER_LOGIN,
  companyCanAccessPath,
  isAdminPublicPath,
  isCompanyRole,
  isTrainerRole,
  resolveStaffRedirect,
  staffHomePath,
  staffLoginPath,
} from "./admin-access";

describe("admin-access", () => {
  it("identifies company representatives as progress-only", () => {
    assert.equal(isCompanyRole(ADMIN_ROLE.COMPANY), true);
    assert.equal(isTrainerRole(ADMIN_ROLE.COMPANY), false);
    assert.equal(isCompanyRole(ADMIN_ROLE.TRAINER), false);
    assert.equal(isTrainerRole(undefined), true);
    assert.equal(staffHomePath(ADMIN_ROLE.COMPANY), PROGRESS_HOME);
    assert.equal(staffHomePath(ADMIN_ROLE.TRAINER), TRAINER_HOME);
  });

  it("keeps both staff logins public and progress as the only company page", () => {
    assert.equal(isAdminPublicPath(TRAINER_LOGIN), true);
    assert.equal(isAdminPublicPath(COMPANY_LOGIN), true);
    assert.equal(companyCanAccessPath(PROGRESS_HOME, false), true);
    assert.equal(companyCanAccessPath(TRAINER_HOME, false), false);
    assert.equal(companyCanAccessPath("/capacitacion/admin/alumnos", false), false);
    assert.equal(companyCanAccessPath("/api/admin/progress/export", true), true);
    assert.equal(companyCanAccessPath("/api/admin/trainings", true), false);
  });

  it("sends unauthenticated progress visits to the company login", () => {
    assert.equal(staffLoginPath(PROGRESS_HOME), COMPANY_LOGIN);
    assert.equal(staffLoginPath(`${PROGRESS_HOME}/login`), COMPANY_LOGIN);
    assert.equal(staffLoginPath(TRAINER_HOME), TRAINER_LOGIN);
    assert.equal(staffLoginPath("/capacitacion/admin/salas"), TRAINER_LOGIN);
  });

  it("never lets a company representative leave the progress home", () => {
    assert.equal(
      resolveStaffRedirect(ADMIN_ROLE.COMPANY, "/capacitacion/admin/salas", "trainer"),
      PROGRESS_HOME,
    );
    assert.equal(resolveStaffRedirect(ADMIN_ROLE.COMPANY, TRAINER_HOME, "company"), PROGRESS_HOME);
    assert.equal(resolveStaffRedirect(ADMIN_ROLE.TRAINER, null, "company"), PROGRESS_HOME);
    assert.equal(
      resolveStaffRedirect(ADMIN_ROLE.TRAINER, "/capacitacion/admin/matriz", "trainer"),
      "/capacitacion/admin/matriz",
    );
    assert.equal(resolveStaffRedirect(ADMIN_ROLE.TRAINER, "https://evil.test", "trainer"), TRAINER_HOME);
  });
});
