import { ConfidenceLevel, RequirementSourceType, RequirementSyncStatus } from "@prisma/client";

export type ParsedRequirementRule = {
  title: string;
  description?: string;
  ruleType?: string;
  courseCodes: string[];
  minSelect?: number;
  minUnits?: number;
  allowedTags?: string[];
  allowedDepartmentCodes?: string[];
  sourceRefText?: string;
};

export type ParsedRequirementCategory = {
  title: string;
  description?: string;
  rules: ParsedRequirementRule[];
};

export type ParsedRequirementDocument = {
  sourceUrl: string;
  sourceType: RequirementSourceType;
  parserKey: string;
  parserStatus: RequirementSyncStatus;
  confidence: ConfidenceLevel;
  notes?: string;
  categories: ParsedRequirementCategory[];
};

export type RequirementImporter = {
  key: string;
  label: string;
  supports(url: string): boolean;
  parse(input: { html: string; sourceUrl: string }): ParsedRequirementDocument;
};
