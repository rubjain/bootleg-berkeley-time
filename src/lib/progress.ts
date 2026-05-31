import { RequirementRuleType } from "@prisma/client";
import { RequirementProgressSummary } from "@/lib/types";

type ProgramForProgress = {
  id: string;
  name: string;
  requirementSources: Array<{ sourceUrl: string }>;
  requirementSets: Array<{
    categories: Array<{
      id: string;
      title: string;
      rules: Array<{
        title: string;
        ruleType: RequirementRuleType;
        minSelect: number | null;
        courseCodes: string[];
        optionGroups: Array<{ optionCourseCodes: string[] }>;
      }>;
    }>;
  }>;
};

function unique(values: string[]) {
  return [...new Set(values)];
}

export function evaluateRequirementProgress(programs: ProgramForProgress[], completedAndPlannedCourseCodes: string[]) {
  const normalized = new Set(completedAndPlannedCourseCodes);

  return programs.map<RequirementProgressSummary>((program) => {
    const activeSet = program.requirementSets[0];
    const categories =
      activeSet?.categories.map((category) => {
        const matchedCourseCodes: string[] = [];
        const remainingRuleTitles: string[] = [];

        let completedRules = 0;
        const totalRules = category.rules.length;

        for (const rule of category.rules) {
          const directMatches = rule.courseCodes.filter((code) => normalized.has(code));
          const optionMatches = unique(
            rule.optionGroups.flatMap((group) =>
              group.optionCourseCodes.filter((code) => normalized.has(code))
            )
          );
          const totalMatches = unique([...directMatches, ...optionMatches]);

          let satisfied = false;

          if (rule.ruleType === "REQUIRED_COURSE") {
            satisfied = rule.courseCodes.every((code) => normalized.has(code));
          } else if (rule.ruleType === "CHOOSE_N_COURSES") {
            satisfied = totalMatches.length >= (rule.minSelect ?? 1);
          } else if (rule.ruleType === "CATEGORY_ELECTIVE") {
            satisfied = totalMatches.length >= (rule.minSelect ?? 1);
          } else if (rule.ruleType === "MIN_UNITS") {
            satisfied = totalMatches.length >= (rule.minSelect ?? 1);
          }

          if (satisfied) {
            completedRules += 1;
            matchedCourseCodes.push(...totalMatches);
          } else {
            remainingRuleTitles.push(rule.title);
          }
        }

        return {
          categoryId: category.id,
          title: category.title,
          completedRules,
          totalRules,
          completionPercent: totalRules === 0 ? 0 : Math.round((completedRules / totalRules) * 100),
          matchedCourseCodes: unique(matchedCourseCodes),
          remainingRuleTitles
        };
      }) ?? [];

    const completedRules = categories.reduce((sum, category) => sum + category.completedRules, 0);
    const totalRules = categories.reduce((sum, category) => sum + category.totalRules, 0);

    return {
      programId: program.id,
      programName: program.name,
      sourceUrl: program.requirementSources[0]?.sourceUrl,
      categories,
      completionPercent: totalRules === 0 ? 0 : Math.round((completedRules / totalRules) * 100)
    };
  });
}
