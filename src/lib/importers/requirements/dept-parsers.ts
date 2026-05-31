import {
  ParsedRequirementCategory,
  ParsedRequirementDocument,
  ParsedRequirementRule
} from "@/lib/importers/requirements/types";
import { ConfidenceLevel, RequirementSourceType, RequirementSyncStatus } from "@prisma/client";

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(input: string) {
  return decodeHtml(stripHtml(input)).replace(/\s+/g, " ").trim();
}

function extractCourseCodes(input: string) {
  const matches = input.match(/\b[A-Z][A-Z& ]{1,12}\s+[A-Z]?\d+[A-Z]?\b/g) ?? [];
  return [...new Set(matches.map((match) => match.replace(/\s+/g, " ").trim()))];
}

function extractDepartmentCodes(courseCodes: string[]) {
  return [
    ...new Set(
      courseCodes
        .map((code) => code.match(/^([A-Z][A-Z& ]+)/)?.[1]?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ];
}

function inferMinSelect(text: string, courseCodes: string[]) {
  const normalized = text.toLowerCase();
  if (/one of|choose 1|select 1/.test(normalized)) return 1;
  if (/two of|choose 2|select 2/.test(normalized)) return 2;
  if (/three of|choose 3/.test(normalized)) return 3;
  if (/all of|complete both/.test(normalized)) return courseCodes.length || undefined;
  return courseCodes.length > 1 ? courseCodes.length : undefined;
}

function parseHeadingSections(html: string): ParsedRequirementCategory[] {
  const sectionPattern = /<(h2|h3|h4)[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<(h2|h3|h4)[^>]*>|$)/gim;
  const itemPattern = /<li[^>]*>([\s\S]*?)<\/li>/gim;
  const sections = [...html.matchAll(sectionPattern)];

  return sections
    .map((section) => {
      const title = normalizeText(section[2]);
      const body = section[3] ?? "";
      const rules: ParsedRequirementRule[] = [...body.matchAll(itemPattern)]
        .map((item) => normalizeText(item[1]))
        .filter(Boolean)
        .map((text, ruleIndex) => {
          const courseCodes = extractCourseCodes(text);
          return {
            title: courseCodes.length ? text.slice(0, 100) : `Requirement ${ruleIndex + 1}`,
            description: text,
            courseCodes,
            minSelect: inferMinSelect(text, courseCodes),
            allowedDepartmentCodes: extractDepartmentCodes(courseCodes),
            sourceRefText: title
          };
        })
        .filter((rule) => rule.description || rule.courseCodes.length > 0);

      const paragraphText = normalizeText(body);
      const fallbackCodes = extractCourseCodes(paragraphText);
      const fallbackRules =
        rules.length > 0 || !fallbackCodes.length
          ? rules
          : [
              {
                title,
                description: paragraphText,
                courseCodes: fallbackCodes,
                minSelect: inferMinSelect(paragraphText, fallbackCodes),
                allowedDepartmentCodes: extractDepartmentCodes(fallbackCodes),
                sourceRefText: title
              }
            ];

      return {
        title,
        description: paragraphText.slice(0, 240) || undefined,
        rules: fallbackRules
      };
    })
    .filter((category) => category.title && category.rules.length > 0);
}

export function parseGenericDepartmentMajorPage(
  sourceUrl: string,
  html: string,
  sourceType: RequirementSourceType = RequirementSourceType.DEPARTMENT_PAGE
): ParsedRequirementDocument {
  const categories = parseHeadingSections(html);
  const fallbackText = normalizeText(html);
  const fallbackCodes = extractCourseCodes(fallbackText);

  const finalCategories =
    categories.length > 0
      ? categories
      : fallbackCodes.length
        ? [
            {
              title: "Department page requirements",
              description: "Extracted from department major page body.",
              rules: [
                {
                  title: "Detected courses",
                  description: fallbackText.slice(0, 400),
                  courseCodes: fallbackCodes,
                  minSelect: inferMinSelect(fallbackText, fallbackCodes),
                  allowedDepartmentCodes: extractDepartmentCodes(fallbackCodes),
                  sourceRefText: sourceUrl
                }
              ]
            }
          ]
        : [];

  return {
    sourceUrl,
    sourceType,
    parserKey: "berkeley-generic-dept",
    parserStatus:
      finalCategories.length > 0 ? RequirementSyncStatus.PARSED : RequirementSyncStatus.REVIEW_REQUIRED,
    confidence: finalCategories.length > 0 ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW,
    notes: "Parsed from Berkeley department major website (supplementary to official catalog).",
    categories: finalCategories
  };
}

export function parseEecsMajorPage(sourceUrl: string, html: string): ParsedRequirementDocument {
  const doc = parseGenericDepartmentMajorPage(sourceUrl, html, RequirementSourceType.DEPARTMENT_PAGE);
  return { ...doc, parserKey: "berkeley-eecs-major" };
}

export function parseDataScienceMajorPage(sourceUrl: string, html: string): ParsedRequirementDocument {
  const doc = parseGenericDepartmentMajorPage(sourceUrl, html, RequirementSourceType.DEPARTMENT_PAGE);
  return { ...doc, parserKey: "berkeley-data-science-major", confidence: ConfidenceLevel.MEDIUM };
}
