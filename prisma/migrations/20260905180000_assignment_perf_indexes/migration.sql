-- CreateIndex
CREATE INDEX IF NOT EXISTS "TrainingAssignment_studentId_status_idx" ON "TrainingAssignment"("studentId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TrainingAssignment_dueAt_status_idx" ON "TrainingAssignment"("dueAt", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TrainingAssignment_status_dueAt_idx" ON "TrainingAssignment"("status", "dueAt");
