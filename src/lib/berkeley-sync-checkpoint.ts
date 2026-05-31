import { BerkeleySyncRunStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type BerkeleySyncCheckpoint = {
  programPageUrls: string[];
  coursePageUrls: string[];
  departmentCodes?: string[];
};

export async function createBerkeleySyncRun(input: {
  schoolSlug: string;
  phase: string;
  checkpoint?: BerkeleySyncCheckpoint;
}) {
  return prisma.berkeleySyncRun.create({
    data: {
      schoolSlug: input.schoolSlug,
      phase: input.phase,
      status: BerkeleySyncRunStatus.RUNNING,
      checkpointJson: input.checkpoint as Prisma.InputJsonValue | undefined,
      discoveredProgramCount: input.checkpoint?.programPageUrls.length ?? 0,
      discoveredCourseCount: input.checkpoint?.coursePageUrls.length ?? 0
    }
  });
}

export async function getBerkeleySyncRun(runId: string) {
  return prisma.berkeleySyncRun.findUnique({ where: { id: runId } });
}

export async function updateBerkeleySyncRun(
  runId: string,
  data: {
    status?: BerkeleySyncRunStatus;
    phase?: string;
    programsSynced?: number;
    coursesImported?: number;
    departmentOffset?: number;
    programOffset?: number;
    courseOffset?: number;
    discoveredProgramCount?: number;
    discoveredCourseCount?: number;
    checkpoint?: BerkeleySyncCheckpoint;
    notes?: string;
    completed?: boolean;
  }
) {
  const checkpointJson = data.checkpoint as Prisma.InputJsonValue | undefined;
  return prisma.berkeleySyncRun.update({
    where: { id: runId },
    data: {
      status: data.status,
      phase: data.phase,
      programsSynced: data.programsSynced,
      coursesImported: data.coursesImported,
      departmentOffset: data.departmentOffset,
      programOffset: data.programOffset,
      courseOffset: data.courseOffset,
      discoveredProgramCount: data.discoveredProgramCount,
      discoveredCourseCount: data.discoveredCourseCount,
      checkpointJson,
      notes: data.notes,
      completedAt: data.completed ? new Date() : undefined
    }
  });
}

export function parseCheckpoint(run: { checkpointJson: unknown }): BerkeleySyncCheckpoint | null {
  if (!run.checkpointJson || typeof run.checkpointJson !== "object") return null;
  const raw = run.checkpointJson as BerkeleySyncCheckpoint;
  if (!Array.isArray(raw.programPageUrls) || !Array.isArray(raw.coursePageUrls)) return null;
  return raw;
}
