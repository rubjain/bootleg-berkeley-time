import { ParsedRequirementDocument, RequirementImporter } from "@/lib/importers/requirements/types";
import { parseBerkeleyProgramRequirementDocument } from "@/lib/berkeley-official-sync";
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
  return decodeHtml(stripHtml(input))
    .replace(/\s+/g, " ")
    .trim();
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

  if (/one of|choose 1|select 1|at least one/.test(normalized)) return 1;
  if (/two of|choose 2|select 2|at least two/.test(normalized)) return 2;
  if (/three of|choose 3|select 3|at least three/.test(normalized)) return 3;
  if (/four of|choose 4|select 4|at least four/.test(normalized)) return 4;
  if (/all of|complete both|required courses|must complete/.test(normalized)) return courseCodes.length || undefined;

  return courseCodes.length > 1 ? courseCodes.length : undefined;
}

function titleFromUrl(sourceUrl: string) {
  return sourceUrl
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Requirement Import";
}

function parseAcademicGuideHtml(sourceUrl: string, html: string): ParsedRequirementDocument {
  const sectionPattern = /<(h2|h3|h4)[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<(h2|h3|h4)[^>]*>|$)/gim;
  const itemPattern = /<li[^>]*>([\s\S]*?)<\/li>/gim;
  const sections = [...html.matchAll(sectionPattern)];

  const categories = sections
    .map((section, index) => {
      const title = normalizeText(section[2]);
      const body = section[3] ?? "";
      const itemMatches = [...body.matchAll(itemPattern)];
      const rules = itemMatches
        .map((itemMatch) => normalizeText(itemMatch[1]))
        .filter(Boolean)
        .map((text, ruleIndex) => {
          const courseCodes = extractCourseCodes(text);
          return {
            title:
              courseCodes.length > 0
                ? text.slice(0, 100)
                : `Rule ${index + 1}.${ruleIndex + 1}`,
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
        rules.length > 0 || fallbackCodes.length === 0
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

  const fallbackText = normalizeText(html);
  const fallbackCodes = extractCourseCodes(fallbackText);

  return {
    sourceUrl,
    sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
    parserKey: "berkeley-academic-guide",
    parserStatus: categories.length > 0 ? RequirementSyncStatus.PARSED : RequirementSyncStatus.REVIEW_REQUIRED,
    confidence: categories.length > 0 ? ConfidenceLevel.MEDIUM : ConfidenceLevel.LOW,
    notes:
      categories.length > 0
        ? "Parsed Berkeley catalog headings and bullet groups into draft requirement categories for review."
        : "Could not confidently segment headings and bullet groups. Route this page through manual review.",
    categories:
      categories.length > 0
        ? categories
        : [
            {
              title: titleFromUrl(sourceUrl),
              description: "Fallback category extracted from full-page text.",
              rules: fallbackCodes.length
                ? [
                    {
                      title: "Detected course references",
                      description: fallbackText.slice(0, 300),
                      courseCodes: fallbackCodes,
                      minSelect: inferMinSelect(fallbackText, fallbackCodes),
                      allowedDepartmentCodes: extractDepartmentCodes(fallbackCodes),
                      sourceRefText: "Full-page fallback parse"
                    }
                  ]
                : []
            }
          ].filter((category) => category.rules.length > 0)
  };
}

const berkeleyAcademicGuideImporter: RequirementImporter = {
  key: "berkeley-academic-guide",
  label: "Berkeley Academic Guide importer",
  supports(url) {
    return (
      url.includes("guide.berkeley.edu") ||
      url.includes("undergraduate.catalog.berkeley.edu/programs/")
    );
  },
  parse({ sourceUrl, html }): ParsedRequirementDocument {
    if (!html.trim()) {
      return {
        sourceUrl,
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-academic-guide",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        confidence: ConfidenceLevel.LOW,
        notes: "No HTML supplied. Provide the Berkeley catalog page HTML to preview a structured parse.",
        categories: []
      };
    }

    if (sourceUrl.includes("undergraduate.catalog.berkeley.edu/programs/")) {
      return parseBerkeleyProgramRequirementDocument(sourceUrl, html);
    }

    return parseAcademicGuideHtml(sourceUrl, html);
  }
};

export const requirementImporters: RequirementImporter[] = [berkeleyAcademicGuideImporter];

export function resolveRequirementImporter(sourceUrl: string) {
  return requirementImporters.find((importer) => importer.supports(sourceUrl));
}
