import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseInstructorNames(instructorText: string | null | undefined): string[] {
  if (!instructorText?.trim()) return [];
  return instructorText
    .split(/[,;]| and /i)
    .map((part) => part.replace(/\s*\(.*?\)\s*/g, "").trim())
    .filter((name) => name.length > 1 && !/^tba$/i.test(name));
}

export async function normalizeInstructorsFromOfferings(input?: {
  schoolSlug?: string;
  limit?: number;
}): Promise<{ created: number; updated: number; linkedOfferings: number }> {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
  if (!school) throw new Error(`School not found: ${schoolSlug}`);

  const offerings = await prisma.courseOffering.findMany({
    where: {
      course: { schoolId: school.id },
      instructorText: { not: null }
    },
    include: {
      course: { include: { department: true } }
    },
    take: input?.limit,
    orderBy: { updatedAt: "desc" }
  });

  let created = 0;
  let updated = 0;
  let linkedOfferings = 0;

  for (const offering of offerings) {
    const names = parseInstructorNames(offering.instructorText);
    if (!names.length) continue;

    const primaryName = names[0];
    const baseSlug = slugify(primaryName);
    const slug = `ucb-${baseSlug}`;

    const existing = await prisma.instructor.findFirst({
      where: {
        schoolId: school.id,
        OR: [{ slug }, { name: primaryName }]
      }
    });

    let instructorSlug = slug;
    if (!existing) {
      const slugTaken = await prisma.instructor.findUnique({ where: { slug: instructorSlug } });
      if (slugTaken) instructorSlug = `${slug}-${offering.id.slice(-6)}`;
    }

    const instructor = existing
      ? await prisma.instructor.update({
          where: { id: existing.id },
          data: {
            departmentId: offering.course.departmentId,
            name: primaryName
          }
        })
      : await prisma.instructor.create({
          data: {
            schoolId: school.id,
            departmentId: offering.course.departmentId,
            name: primaryName,
            slug: instructorSlug,
            bio: `Instructor associated with ${offering.course.code} offerings.`
          }
        });

    if (existing) updated += 1;
    else created += 1;

    await prisma.courseOffering.update({
      where: { id: offering.id },
      data: {
        instructorText: names.join(", ")
      }
    });
    linkedOfferings += 1;
  }

  return { created, updated, linkedOfferings };
}
