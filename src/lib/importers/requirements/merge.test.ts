import { describe, expect, it } from "vitest";
import { mergeRequirementDocuments } from "@/lib/importers/requirements/merge";
import { ConfidenceLevel, RequirementSourceType, RequirementSyncStatus } from "@prisma/client";

describe("mergeRequirementDocuments", () => {
  it("dedupes catalog and dept rules with same course codes", () => {
    const primary = {
      sourceUrl: "https://undergraduate.catalog.berkeley.edu/programs/A50AMU",
      sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
      parserKey: "catalog",
      parserStatus: RequirementSyncStatus.PARSED,
      confidence: ConfidenceLevel.HIGH,
      categories: [
        {
          title: "Core",
          rules: [
            {
              title: "Data 8",
              courseCodes: ["DATA C8"],
              minSelect: 1,
              allowedDepartmentCodes: [],
              sourceRefText: "catalog"
            }
          ]
        }
      ]
    };

    const supplementary = [
      {
        sourceUrl: "https://data.berkeley.edu/major",
        sourceType: RequirementSourceType.DEPARTMENT_PAGE,
        parserKey: "dept",
        parserStatus: RequirementSyncStatus.PARSED,
        confidence: ConfidenceLevel.MEDIUM,
        categories: [
          {
            title: "Core",
            rules: [
              {
                title: "Foundations",
                courseCodes: ["DATA C8"],
                minSelect: 1,
                allowedDepartmentCodes: [],
                sourceRefText: "dept"
              }
            ]
          }
        ]
      }
    ];

    const merged = mergeRequirementDocuments({ primary, supplementary });
    expect(merged.categories[0].rules).toHaveLength(1);
    expect(merged.categories[0].rules[0].sourceRefText).toContain("Also listed on");
  });

  it("adds dept-only categories", () => {
    const primary = {
      sourceUrl: "https://catalog",
      sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
      parserKey: "catalog",
      parserStatus: RequirementSyncStatus.PARSED,
      confidence: ConfidenceLevel.HIGH,
      categories: []
    };

    const merged = mergeRequirementDocuments({
      primary,
      supplementary: [
        {
          sourceUrl: "https://eecs.berkeley.edu",
          sourceType: RequirementSourceType.DEPARTMENT_PAGE,
          parserKey: "dept",
          parserStatus: RequirementSyncStatus.PARSED,
          confidence: ConfidenceLevel.MEDIUM,
          categories: [
            {
              title: "Ethics elective",
              rules: [
                {
                  title: "Choose one",
                  courseCodes: ["DATA C104"],
                  minSelect: 1,
                  allowedDepartmentCodes: []
                }
              ]
            }
          ]
        }
      ]
    });

    expect(merged.categories).toHaveLength(1);
    expect(merged.parserStatus).toBe(RequirementSyncStatus.REVIEW_REQUIRED);
  });
});
