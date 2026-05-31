import type { ParsedRequirementCategory, ParsedRequirementDocument } from "@/lib/importers/requirements/types";
import { ConfidenceLevel, RequirementSyncStatus } from "@prisma/client";

export type MergeConflict = {
  categoryTitle: string;
  ruleTitle: string;
  message: string;
};

export type MergedRequirementDocument = ParsedRequirementDocument & {
  conflicts: MergeConflict[];
  supplementarySourceUrls: string[];
};

function normalizeCategoryKey(title: string) {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

function ruleSignature(rule: { courseCodes: string[]; title: string }) {
  return `${rule.title.toLowerCase()}::${[...rule.courseCodes].sort().join(",")}`;
}

export function mergeRequirementDocuments(input: {
  primary: ParsedRequirementDocument;
  supplementary: ParsedRequirementDocument[];
  autoApproveHighConfidence?: boolean;
}): MergedRequirementDocument {
  const conflicts: MergeConflict[] = [];
  const supplementarySourceUrls = input.supplementary.map((doc) => doc.sourceUrl);
  const categoryMap = new Map<string, ParsedRequirementCategory>();

  for (const category of input.primary.categories) {
    categoryMap.set(normalizeCategoryKey(category.title), {
      ...category,
      rules: category.rules.map((rule) => ({ ...rule }))
    });
  }

  for (const doc of input.supplementary) {
    for (const category of doc.categories) {
      const key = normalizeCategoryKey(category.title);
      const existing = categoryMap.get(key);

      if (!existing) {
        categoryMap.set(key, {
          ...category,
          rules: category.rules.map((rule) => ({
            ...rule,
            sourceRefText: rule.sourceRefText
              ? `${rule.sourceRefText} (dept: ${doc.sourceUrl})`
              : `Supplementary: ${doc.sourceUrl}`
          }))
        });
        continue;
      }

      const existingSignatures = new Set(existing.rules.map((rule) => ruleSignature(rule)));

      for (const rule of category.rules) {
        const signature = ruleSignature(rule);
        const duplicateByCode = existing.rules.find(
          (existingRule) =>
            rule.courseCodes.length > 0 &&
            existingRule.courseCodes.length > 0 &&
            rule.courseCodes.every((code) => existingRule.courseCodes.includes(code))
        );

        if (duplicateByCode) {
          if (
            rule.minSelect &&
            duplicateByCode.minSelect &&
            rule.minSelect !== duplicateByCode.minSelect
          ) {
            conflicts.push({
              categoryTitle: category.title,
              ruleTitle: rule.title,
              message: `minSelect conflict: catalog=${duplicateByCode.minSelect}, dept=${rule.minSelect}`
            });
          }
          duplicateByCode.sourceRefText = [
            duplicateByCode.sourceRefText,
            `Also listed on ${doc.sourceUrl}`
          ]
            .filter(Boolean)
            .join(" · ");
          continue;
        }

        if (!existingSignatures.has(signature)) {
          existing.rules.push({
            ...rule,
            sourceRefText: rule.sourceRefText
              ? `${rule.sourceRefText} (dept: ${doc.sourceUrl})`
              : `Supplementary: ${doc.sourceUrl}`
          });
          existingSignatures.add(signature);
        }
      }
    }
  }

  const hasConflicts = conflicts.length > 0;
  const hasLowConfidenceSupplementary = input.supplementary.some(
    (doc) => doc.confidence === ConfidenceLevel.LOW
  );

  let parserStatus = input.primary.parserStatus;
  if (hasConflicts || hasLowConfidenceSupplementary) {
    parserStatus = RequirementSyncStatus.REVIEW_REQUIRED;
  } else if (input.supplementary.length > 0 && input.autoApproveHighConfidence) {
    parserStatus = RequirementSyncStatus.PARSED;
  } else if (input.supplementary.length > 0) {
    parserStatus = RequirementSyncStatus.REVIEW_REQUIRED;
  }

  return {
    ...input.primary,
    parserStatus,
    confidence: hasConflicts ? ConfidenceLevel.MEDIUM : input.primary.confidence,
    notes: [
      input.primary.notes,
      input.supplementary.length
        ? `Merged ${input.supplementary.length} supplementary source(s).`
        : undefined,
      hasConflicts ? `${conflicts.length} conflict(s) flagged for review.` : undefined
    ]
      .filter(Boolean)
      .join(" "),
    categories: [...categoryMap.values()],
    conflicts,
    supplementarySourceUrls
  };
}
