import { DataStatus } from "@prisma/client";
import { instructorRmpAliases } from "@/lib/instructor-rmp-aliases";
import { getInstructorRmpProfessorId } from "@/lib/prisma-instructor";
import { prisma } from "@/lib/prisma";
import { lookupLiveRmpRating } from "@/lib/rmp/service";

export type RmpSyncResult = {
  scanned: number;
  synced: number;
  skipped: number;
  errors: string[];
};

export async function syncInstructorRmpRatings(input?: { slugs?: string[]; limit?: number }): Promise<RmpSyncResult> {
  const instructors = await prisma.instructor.findMany({
    where: input?.slugs?.length ? { slug: { in: input.slugs } } : undefined,
    take: input?.limit,
    include: { department: true },
    orderBy: { name: "asc" }
  });

  const result: RmpSyncResult = {
    scanned: instructors.length,
    synced: 0,
    skipped: 0,
    errors: []
  };

  for (const instructor of instructors) {
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
  }

  return result;
}
