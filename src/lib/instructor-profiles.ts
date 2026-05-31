import { InstructorProfile } from "@/lib/types";

type OfferingInstructorRow = {
  role: string | null;
  instructor: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    rmpProfessorId?: string | null;
    department?: { code: string; name: string } | null;
    ratings: Array<{
      rating: number | null;
      averageDifficulty: number | null;
      reviewCount: number | null;
      sentimentSummary: string | null;
      sourceName: string;
      sourceUrl: string | null;
    }>;
  };
};

type OfferingRow = {
  term: { name: string };
  instructors: OfferingInstructorRow[];
};

export function buildInstructorProfiles(offerings: OfferingRow[]): InstructorProfile[] {
  const byId = new Map<string, InstructorProfile>();

  for (const offering of offerings) {
    for (const link of offering.instructors) {
      const instructor = link.instructor;
      const rating = pickBestRating(instructor.ratings);
      const existing = byId.get(instructor.id);

      if (!existing) {
        byId.set(instructor.id, {
          id: instructor.id,
          name: instructor.name,
          slug: instructor.slug,
          departmentCode: instructor.department?.code,
          departmentName: instructor.department?.name,
          bio: instructor.bio ?? undefined,
          rmpProfessorId: instructor.rmpProfessorId ?? undefined,
          recentTerms: [offering.term.name],
          role: link.role ?? undefined,
          rating: rating
            ? {
                overall: rating.rating ?? 0,
                difficulty: rating.averageDifficulty ?? 0,
                reviewCount: rating.reviewCount ?? 0,
                summary: rating.sentimentSummary ?? undefined,
                sourceName: formatRatingSource(rating.sourceName),
                sourceUrl: rating.sourceUrl ?? defaultRateMyProfessorsSearchUrl(instructor.name)
              }
            : undefined
        });
        continue;
      }

      if (!existing.recentTerms.includes(offering.term.name)) {
        existing.recentTerms.push(offering.term.name);
      }
    }
  }

  return [...byId.values()].sort((left, right) => (right.rating?.overall ?? 0) - (left.rating?.overall ?? 0));
}

function pickBestRating(
  ratings: OfferingInstructorRow["instructor"]["ratings"]
): OfferingInstructorRow["instructor"]["ratings"][number] | undefined {
  if (!ratings.length) return undefined;
  return [...ratings].sort((left, right) => (right.reviewCount ?? 0) - (left.reviewCount ?? 0))[0];
}

function formatRatingSource(sourceName: string) {
  if (sourceName.toLowerCase().includes("rate my professor") || sourceName.toLowerCase().includes("ratemyprofessor")) {
    return "Rate My Professors";
  }
  if (sourceName.toLowerCase().includes("placeholder")) {
    return "Rate My Professors (sample)";
  }
  return sourceName;
}

export function defaultRateMyProfessorsSearchUrl(instructorName: string) {
  return `https://www.ratemyprofessors.com/search/professors?q=${encodeURIComponent(instructorName)}`;
}

export function summarizeProfessorQuality(instructors: InstructorProfile[]) {
  const rated = instructors.filter((instructor) => instructor.rating);
  if (!rated.length) {
    return "No Rate My Professors ratings are available for recent instructors yet.";
  }

  const liveCount = rated.filter((instructor) => instructor.rating?.isLive).length;
  const sourceLabel =
    liveCount === rated.length
      ? "live on Rate My Professors"
      : liveCount > 0
        ? `${liveCount} live on Rate My Professors`
        : "on Rate My Professors";

  const top = rated[0];
  if (rated.length === 1 && top.rating) {
    return `${top.name} averages ${top.rating.overall.toFixed(1)}/5.0 ${sourceLabel} (${top.rating.reviewCount} reviews).`;
  }

  const average =
    rated.reduce((sum, instructor) => sum + (instructor.rating?.overall ?? 0), 0) / rated.length;

  return `${rated.length} recent instructors rated ${sourceLabel}, averaging ${average.toFixed(1)}/5.0. Top-rated: ${top.name}.`;
}
