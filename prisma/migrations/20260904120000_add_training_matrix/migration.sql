-- AlterTable
ALTER TABLE "Training" ADD COLUMN "code" TEXT;
ALTER TABLE "Training" ADD COLUMN "validityDays" INTEGER NOT NULL DEFAULT 365;

-- CreateTable
CREATE TABLE "Sede" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Puesto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dni" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "sedeId" TEXT,
    "puestoId" TEXT,
    "tareaId" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Student_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Student_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("id", "dni", "firstName", "lastName", "email", "phone", "company", "profileCompleted", "createdAt", "updatedAt")
SELECT "id", "dni", "firstName", "lastName", "email", "phone", "company", "profileCompleted", "createdAt", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_dni_key" ON "Student"("dni");
CREATE INDEX "Student_sedeId_idx" ON "Student"("sedeId");
CREATE INDEX "Student_puestoId_idx" ON "Student"("puestoId");
CREATE INDEX "Student_tareaId_idx" ON "Student"("tareaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "TrainingScope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trainingId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "puestoId" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,
    "validityDays" INTEGER NOT NULL,
    CONSTRAINT "TrainingScope_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingScope_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingScope_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingScope_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnualMatrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MatrixCell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matrixId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "puestoId" TEXT NOT NULL,
    "tareaId" TEXT NOT NULL,
    CONSTRAINT "MatrixCell_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "AnnualMatrix" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatrixCell_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "Sede" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatrixCell_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatrixCell_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatrixCellItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cellId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "validityDays" INTEGER NOT NULL,
    CONSTRAINT "MatrixCellItem_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "MatrixCell" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatrixCellItem_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "matrixId" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "validityDays" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "notice30At" DATETIME,
    "notice7At" DATETIME,
    "notice1At" DATETIME,
    "noticeExpiredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingAssignment_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingAssignment_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "AnnualMatrix" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingAssignment_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "MatrixCell" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Sede_code_key" ON "Sede"("code");
CREATE UNIQUE INDEX "Puesto_code_key" ON "Puesto"("code");
CREATE UNIQUE INDEX "Tarea_code_key" ON "Tarea"("code");
CREATE UNIQUE INDEX "Training_code_key" ON "Training"("code");
CREATE UNIQUE INDEX "TrainingScope_trainingId_sedeId_puestoId_tareaId_key" ON "TrainingScope"("trainingId", "sedeId", "puestoId", "tareaId");
CREATE UNIQUE INDEX "AnnualMatrix_year_key" ON "AnnualMatrix"("year");
CREATE UNIQUE INDEX "MatrixCell_matrixId_sedeId_puestoId_tareaId_key" ON "MatrixCell"("matrixId", "sedeId", "puestoId", "tareaId");
CREATE UNIQUE INDEX "MatrixCellItem_cellId_trainingId_key" ON "MatrixCellItem"("cellId", "trainingId");
CREATE UNIQUE INDEX "TrainingAssignment_studentId_trainingId_matrixId_key" ON "TrainingAssignment"("studentId", "trainingId", "matrixId");
CREATE INDEX "TrainingAssignment_status_dueAt_idx" ON "TrainingAssignment"("status", "dueAt");
