-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "score" INTEGER,
    "materialsViewed" TEXT NOT NULL DEFAULT '[]',
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrainingProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingProgress_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "Training" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TrainingProgress" ("completedAt", "id", "score", "status", "studentId", "trainingId", "updatedAt") SELECT "completedAt", "id", "score", "status", "studentId", "trainingId", "updatedAt" FROM "TrainingProgress";
DROP TABLE "TrainingProgress";
ALTER TABLE "new_TrainingProgress" RENAME TO "TrainingProgress";
CREATE UNIQUE INDEX "TrainingProgress_studentId_trainingId_key" ON "TrainingProgress"("studentId", "trainingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
