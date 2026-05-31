-- CreateEnum
CREATE TYPE "BerkeleySyncRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'PAUSED');

-- CreateTable
CREATE TABLE "BerkeleySyncRun" (
    "id" TEXT NOT NULL,
    "schoolSlug" TEXT NOT NULL,
    "status" "BerkeleySyncRunStatus" NOT NULL DEFAULT 'RUNNING',
    "phase" TEXT NOT NULL,
    "discoveredProgramCount" INTEGER NOT NULL DEFAULT 0,
    "discoveredCourseCount" INTEGER NOT NULL DEFAULT 0,
    "programsSynced" INTEGER NOT NULL DEFAULT 0,
    "coursesImported" INTEGER NOT NULL DEFAULT 0,
    "departmentOffset" INTEGER NOT NULL DEFAULT 0,
    "programOffset" INTEGER NOT NULL DEFAULT 0,
    "courseOffset" INTEGER NOT NULL DEFAULT 0,
    "checkpointJson" JSONB,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BerkeleySyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BerkeleySyncRun_schoolSlug_status_idx" ON "BerkeleySyncRun"("schoolSlug", "status");
