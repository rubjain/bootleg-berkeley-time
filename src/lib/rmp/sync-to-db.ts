import { DataStatus } from "@prisma/client";
import { instructorRmpAliases } from "@/lib/instructor-rmp-aliases";
import { getInstructorRmpProfessorId } from "@/lib/prisma-instructor";
import { prisma } from "@/lib/prisma";
import { lookupLiveRmpRating } from "@/lib/rmp/service";

const RMP_REQUEST_DELAY_MS = 1000;

export type RmpSyncResult = {
  scanned: number;
  synced: number;
  skipped: number;
  errors: string[];
  cursor?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncInstructorRmpRatings(input?: {
  slugs?: string[];
  limit?: number;
  cursor?: string;
  rateLimitMs?: number;
}): Promise<RmpSyncResult> {
  const rateLimitMs = input?.rateLimitMs ?? RMP_REQUEST_DELAY_MS;
  const instructors = await prisma.instructor.findMany({
    where: input?.slugs?.length ? { slug: { in: input.slugs } } : undefined,
    take: input?.limit,
    cursor: input?.cursor ? { id: input.cursor } : undefined,
    skip: input?.cursor ? 1 : undefined,
    include: { department: true },
    orderBy: { id: "asc" }
  });

  const result: RmpSyncResult = {
    scanned: instructors.length,
    synced: 0,
    skipped: 0,
    errors: []
  };

  for (const [index, instructor] of instructors.entries()) {
    if (index > 0) {
      await sleep(rateLimitMs);
    }

    try {
      const alias = instructorRmpAliases[instructor.slug];
      const live = await lookupLiveRmpRating({
        slug: instructor.slug,
        name: alias?.searchName ?? instructor.name,
        departmentCode: instructor.department?.code,
        rmpProfessorId: getInstructorRmpProfessorId(instructor) ?? alias?.rmpProfessorId
      });

      if (!live || live.reviewCount === 0) {
        result.skipped += 1;
        continue;
      }

      await prisma.$transaction([
        prisma.instructor.update({
          where: { id: instructor.id },
          data: { rmpProfessorId: live.professorId } as { rmpProfessorId: string }
        }),
        prisma.professorRating.deleteMany({
          where: {
            instructorId: instructor.id,
            sourceName: { contains: "Rate My Professors", mode: "insensitive" }
          }
        }),
        prisma.professorRating.create({
          data: {
            instructorId: instructor.id,
            sourceName: "Rate My Professors",
            rating: live.overall,
            averageDifficulty: live.difficulty,
            reviewCount: live.reviewCount,
            sentimentSummary: `Synced from live RMP on ${new Date(live.fetchedAt).toLocaleDateString()}.`,
            sourceUrl: live.sourceUrl,
            dataStatus: DataStatus.HISTORICAL
          }
        })
      ]);

      result.synced += 1;
    } catch (error) {
      result.errors.push(
        `${instructor.slug}: ${error instanceof Error ? error.message : "sync failed"}`
      );
    }

    result.cursor = instructor.id;
  }

  return result;
}

export async function syncRmpForSchool(input?: {
  schoolSlug?: string;
  batchSize?: number;
  maxBatches?: number;
}): Promise<RmpSyncResult & { batches: number }> {
  const batchSize = input?.batchSize ?? 50;
  const maxBatches = input?.maxBatches ?? 10;
  let cursor: string | undefined;
  let totalScanned = 0;
  let totalSynced = 0;
  let totalSkipped = 0;
  const errors: string[] = [];
  let batches = 0;

  for (let batch = 0; batch < maxBatches; batch += 1) {
    const school = await prisma.school.findUnique({
      where: { slug: input?.schoolSlug ?? "uc-berkeley" },
      select: { id: true }
    });
    if (!school) break;

    const instructors = await prisma.instructor.findMany({
      where: { schoolId: school.id },
      take: batchSize,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : undefined,
      orderBy: { id: "asc" },
      select: { slug: true }
    });

    if (!instructors.length) break;

    const result = await syncInstructorRmpRatings({
      slugs: instructors.map((item) => item.slug),
      rateLimitMs: RMP_REQUEST_DELAY_MS
    });

    totalScanned += result.scanned;
    totalSynced += result.synced;
    totalSkipped += result.skipped;
    errors.push(...result.errors);
    cursor = result.cursor;
    batches += 1;

    if (instructors.length < batchSize) break;
  }

  return {
    scanned: totalScanned,
    synced: totalSynced,
    skipped: totalSkipped,
    errors,
    cursor,
    batches
  };
}
