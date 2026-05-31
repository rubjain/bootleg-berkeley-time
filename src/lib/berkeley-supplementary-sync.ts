import { fetchBerkeleyHtml } from "@/lib/berkeley-fetch";
import { getSupplementarySourcesForProgram } from "@/lib/berkeley-supplementary-sources";
import {
  parseDataScienceMajorPage,
  parseEecsMajorPage,
  parseGenericDepartmentMajorPage
} from "@/lib/importers/requirements/dept-parsers";
import { mergeRequirementDocuments } from "@/lib/importers/requirements/merge";
import type { ParsedRequirementDocument } from "@/lib/importers/requirements/types";
import { resolveRequirementImporter } from "@/lib/importers/requirements/registry";
import { parseBerkeleyProgramRequirementDocument, syncProgramRequirements } from "@/lib/berkeley-official-sync";
import { prisma } from "@/lib/prisma";
import { ConfidenceLevel, RequirementSourceType, RequirementSyncStatus } from "@prisma/client";

function parseSupplementaryHtml(parserKey: string, sourceUrl: string, html: string, sourceType: RequirementSourceType) {
  if (parserKey === "berkeley-eecs-major") {
    return parseEecsMajorPage(sourceUrl, html);
  }
  if (parserKey === "berkeley-data-science-major") {
    return parseDataScienceMajorPage(sourceUrl, html);
  }
  const importer = resolveRequirementImporter(sourceUrl);
  if (importer && sourceUrl.includes("guide.berkeley.edu")) {
    return importer.parse({ sourceUrl, html });
  }
  return parseGenericDepartmentMajorPage(sourceUrl, html, sourceType);
}

export async function syncBerkeleySupplementaryForProgram(input: {
  programId: string;
  schoolId: string;
  catalogSourceUrl: string;
  catalogHtml?: string;
  autoApproveHighConfidence?: boolean;
}) {
  const program = await prisma.program.findUnique({
    where: { id: input.programId },
    select: { id: true, slug: true, name: true, code: true }
  });
  if (!program) throw new Error("Program not found");

  const catalogHtml =
    input.catalogHtml ?? (await fetchBerkeleyHtml(input.catalogSourceUrl).catch(() => ""));
  const primary = catalogHtml.trim()
    ? parseBerkeleyProgramRequirementDocument(input.catalogSourceUrl, catalogHtml)
    : {
        sourceUrl: input.catalogSourceUrl,
        sourceType: RequirementSourceType.UNIVERSITY_CATALOG,
        parserKey: "berkeley-undergraduate-catalog",
        parserStatus: RequirementSyncStatus.REVIEW_REQUIRED,
        confidence: ConfidenceLevel.LOW,
        categories: []
      };

  const entries = getSupplementarySourcesForProgram(program);
  const supplementary: ParsedRequirementDocument[] = [];

  for (const entry of entries) {
    try {
      const html = await fetchBerkeleyHtml(entry.sourceUrl);
      const parsed = parseSupplementaryHtml(entry.parserKey, entry.sourceUrl, html, entry.sourceType);
      supplementary.push(parsed);

      const existingSupplementary = await prisma.requirementSource.findFirst({
        where: {
          programId: program.id,
          parserKey: entry.parserKey
        }
      });
      const snapshot = { label: entry.label, categoryCount: parsed.categories.length };
      if (existingSupplementary) {
        await prisma.requirementSource.update({
          where: { id: existingSupplementary.id },
          data: {
            sourceUrl: entry.sourceUrl,
            sourceType: entry.sourceType,
            parserStatus: parsed.parserStatus,
            confidence: parsed.confidence,
            lastSyncedAt: new Date(),
            notes: parsed.notes,
            rawSnapshotJson: snapshot
          }
        });
      } else {
        await prisma.requirementSource.create({
          data: {
            schoolId: input.schoolId,
            programId: program.id,
            sourceUrl: entry.sourceUrl,
            sourceType: entry.sourceType,
            parserKey: entry.parserKey,
            parserStatus: parsed.parserStatus,
            confidence: parsed.confidence,
            lastSyncedAt: new Date(),
            notes: parsed.notes,
            rawSnapshotJson: snapshot
          }
        });
      }
    } catch (error) {
      supplementary.push({
        sourceUrl: entry.sourceUrl,
        sourceType: entry.sourceType,
        parserKey: entry.parserKey,
        parserStatus: RequirementSyncStatus.FAILED,
        confidence: ConfidenceLevel.LOW,
        notes: `Fetch failed: ${error instanceof Error ? error.message : "unknown"}`,
        categories: []
      });
    }
  }

  const merged = mergeRequirementDocuments({
    primary,
    supplementary: supplementary.filter((doc) => doc.categories.length > 0),
    autoApproveHighConfidence: input.autoApproveHighConfidence
  });

  await syncProgramRequirements({
    schoolId: input.schoolId,
    programId: program.id,
    sourceUrl: input.catalogSourceUrl,
    parsed: merged,
    rawSnapshotJson: { conflicts: merged.conflicts, supplementarySourceUrls: merged.supplementarySourceUrls }
  });

  return {
    programSlug: program.slug,
    supplementaryCount: supplementary.length,
    conflictCount: merged.conflicts.length,
    parserStatus: merged.parserStatus,
    categoryCount: merged.categories.length
  };
}

export async function syncBerkeleySupplementaryForSchool(input?: {
  schoolSlug?: string;
  limit?: number;
  autoApproveHighConfidence?: boolean;
  onProgress?: (message: string) => void;
}) {
  const schoolSlug = input?.schoolSlug ?? "uc-berkeley";
  const school = await prisma.school.findUnique({ where: { slug: schoolSlug } });
  if (!school) throw new Error(`School not found: ${schoolSlug}`);

  const programs = await prisma.program.findMany({
    where: { schoolId: school.id, isActive: true },
    include: {
      requirementSources: {
        where: { sourceUrl: { contains: "undergraduate.catalog.berkeley.edu/programs/" } },
        take: 1
      }
    },
    take: input?.limit,
    orderBy: { name: "asc" }
  });

  const results = [];
  for (const [index, program] of programs.entries()) {
    const catalogSource = program.requirementSources[0];
    if (!catalogSource?.sourceUrl) continue;

    input?.onProgress?.(`Supplementary sync ${index + 1}/${programs.length}: ${program.name}`);
    try {
      const result = await syncBerkeleySupplementaryForProgram({
        programId: program.id,
        schoolId: school.id,
        catalogSourceUrl: catalogSource.sourceUrl,
        autoApproveHighConfidence: input?.autoApproveHighConfidence
      });
      results.push(result);
    } catch (error) {
      results.push({
        programSlug: program.slug,
        error: error instanceof Error ? error.message : "sync failed"
      });
    }
  }

  return { schoolSlug, results };
}
