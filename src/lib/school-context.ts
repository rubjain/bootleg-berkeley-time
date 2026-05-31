import { cookies } from "next/headers";
import { mockSchools } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { SchoolSummary } from "@/lib/types";

export const SCHOOL_COOKIE = "coursemap_school";

export async function getActiveSchoolSlug(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get(SCHOOL_COOKIE)?.value ?? process.env.NEXT_PUBLIC_DEFAULT_SCHOOL_SLUG ?? "uc-berkeley";
}

export async function getActiveSchool(): Promise<SchoolSummary | null> {
  const slug = await getActiveSchoolSlug();

  try {
    const school = await prisma.school.findUnique({
      where: { slug },
      select: { id: true, code: true, name: true, shortName: true, slug: true, city: true, state: true, isActive: true }
    });

    if (school) {
      return {
        ...school,
        city: school.city ?? undefined,
        state: school.state ?? undefined
      };
    }
  } catch {
    // fall through to mock
  }

  return mockSchools.find((school) => school.slug === slug) ?? mockSchools[0] ?? null;
}
