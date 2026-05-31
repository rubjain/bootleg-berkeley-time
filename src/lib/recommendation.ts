import { CourseSummary, RecommendationResult } from "@/lib/types";
import { getCommunityRecommendationSignal } from "@/lib/social-data";

type RecommendationInput = {
  selectedProgramNames: string[];
  completedCourseCodes: string[];
  desiredUnitLoad: number;
  candidateCourses: CourseSummary[];
  socialSignalsBySlug?: Record<string, { scoreDelta: number; summary: string }>;
};

function pickComparePartner(course: CourseSummary, candidates: CourseSummary[]) {
  const others = candidates.filter((item) => item.slug !== course.slug);
  if (!others.length) return undefined;

  const sameDepartment = others.find((item) => item.departmentCode === course.departmentCode);
  if (sameDepartment) return sameDepartment;

  const sharedTag = others.find((item) =>
    item.requirementTags.some((tag) => course.requirementTags.includes(tag))
  );
  if (sharedTag) return sharedTag;

  return others[0];
}

export function scoreRecommendedCourses(input: RecommendationInput): RecommendationResult[] {
  const scored = input.candidateCourses
    .map((course) => {
      let score = 40;
      const reasons: string[] = [];
      const warnings: string[] = [];
      const communitySignal = input.socialSignalsBySlug?.[course.slug] ?? getCommunityRecommendationSignal(course.slug);

      if (course.requirementTags.some((tag) => tag.includes("core"))) {
        score += 25;
        reasons.push("Directly supports remaining core requirements");
      }

      if (!input.completedCourseCodes.includes(course.code) && course.level === "Lower Division") {
        score += 12;
        reasons.push("Fits an early progression-friendly sequence");
      }

      if (course.fillRisk.toLowerCase().includes("quickly")) {
        warnings.push("Historically fills quickly, so backup planning is recommended");
        score -= 3;
      }

      if (input.desiredUnitLoad <= 16 && course.units.startsWith("4")) {
        score += 8;
        reasons.push("Keeps the unit load manageable for a balanced term");
      }

      if (
        input.selectedProgramNames.some((name) =>
          course.requirementTags.some((tag) => tag.includes(name.toLowerCase().split(" ")[0]))
        )
      ) {
        score += 10;
      }

      score += communitySignal.scoreDelta;
      if (communitySignal.scoreDelta > 0) {
        reasons.push("Community sentiment is positive for this course");
      }

      return { course, result: {
        courseCode: course.code,
        title: course.title,
        courseSlug: course.slug,
        score,
        reasons,
        warnings,
        socialSignal: communitySignal.summary
      } satisfies RecommendationResult };
    })
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 5);

  return scored.map((item) => {
    const partner =
      pickComparePartner(
        item.course,
        scored.map((entry) => entry.course)
      ) ?? input.candidateCourses.find((candidate) => candidate.slug !== item.course.slug);

    return {
      ...item.result,
      compareWithSlug: partner?.slug,
      compareWithCode: partner?.code
    };
  });
}
