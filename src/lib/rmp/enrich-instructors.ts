import type { InstructorProfile } from "@/lib/types";
import { lookupLiveRmpRating, type LiveRmpRating } from "@/lib/rmp/service";

function buildLiveSummary(live: LiveRmpRating) {
  const takeAgain =
    live.wouldTakeAgainPercent != null && live.wouldTakeAgainPercent >= 0
      ? ` About ${Math.round(live.wouldTakeAgainPercent)}% of students would take this professor again.`
      : "";
  return `Live Rate My Professors score: ${live.overall.toFixed(1)}/5.0 overall with ${live.reviewCount} reviews and ${live.difficulty.toFixed(1)}/5.0 difficulty.${takeAgain}`;
}

export async function enrichInstructorProfile(profile: InstructorProfile): Promise<InstructorProfile> {
  const live = await lookupLiveRmpRating({
    slug: profile.slug,
    name: profile.name,
    departmentCode: profile.departmentCode,
    rmpProfessorId: profile.rmpProfessorId
  });

  if (!live || live.reviewCount === 0) {
    return profile;
  }

  const rating: InstructorProfile["rating"] = {
    overall: live.overall,
    difficulty: live.difficulty,
    reviewCount: live.reviewCount,
    summary: buildLiveSummary(live),
    sourceName: "Rate My Professors",
    sourceUrl: live.sourceUrl,
    isLive: true,
    fetchedAt: live.fetchedAt,
    rmpProfessorId: live.professorId,
    matchedName: live.displayName !== profile.name ? live.displayName : undefined,
    wouldTakeAgainPercent: live.wouldTakeAgainPercent
  };

  return { ...profile, rating };
}

export async function enrichInstructorProfiles(profiles: InstructorProfile[]) {
  if (!profiles.length) return profiles;

  const unique = new Map(profiles.map((profile) => [profile.id, profile]));
  const enrichedEntries = await Promise.all(
    [...unique.values()].map(async (profile) => [profile.id, await enrichInstructorProfile(profile)] as const)
  );
  const enrichedById = new Map(enrichedEntries);

  return profiles.map((profile) => enrichedById.get(profile.id) ?? profile);
}
