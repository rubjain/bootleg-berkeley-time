import { RequirementSourceType } from "@prisma/client";

export type SupplementarySourceEntry = {
  programSlug?: string;
  programCode?: string;
  programNameMatch?: string;
  sourceUrl: string;
  sourceType: RequirementSourceType;
  parserKey: string;
  label: string;
};

/** Curated Berkeley department major pages and legacy guide URLs for merge with catalog data. */
export const berkeleySupplementarySources: SupplementarySourceEntry[] = [
  {
    programSlug: "ucb-computer-science-major",
    programNameMatch: "Computer Science",
    sourceUrl: "https://eecs.berkeley.edu/academics/undergraduate/cs-ba",
    sourceType: RequirementSourceType.DEPARTMENT_PAGE,
    parserKey: "berkeley-eecs-major",
    label: "EECS CS BA requirements"
  },
  {
    programSlug: "ucb-data-science-major",
    programNameMatch: "Data Science",
    sourceUrl: "https://data.berkeley.edu/academics/undergraduate-programs/data-science-ba",
    sourceType: RequirementSourceType.DEPARTMENT_PAGE,
    parserKey: "berkeley-data-science-major",
    label: "Data Science major requirements"
  },
  {
    programSlug: "ucb-economics-major",
    programNameMatch: "Economics",
    sourceUrl: "https://www.econ.berkeley.edu/undergraduate/major",
    sourceType: RequirementSourceType.DEPARTMENT_PAGE,
    parserKey: "berkeley-generic-dept",
    label: "Economics major requirements"
  },
  {
    programNameMatch: "Business Administration",
    sourceUrl: "https://haas.berkeley.edu/undergrad/academics/curriculum/",
    sourceType: RequirementSourceType.COLLEGE_PAGE,
    parserKey: "berkeley-generic-dept",
    label: "Haas undergraduate curriculum"
  },
  {
    programNameMatch: "Integrative Biology",
    sourceUrl: "https://ib.berkeley.edu/undergraduate/major-requirements",
    sourceType: RequirementSourceType.DEPARTMENT_PAGE,
    parserKey: "berkeley-generic-dept",
    label: "IB major requirements"
  },
  {
    programNameMatch: "Mathematics",
    sourceUrl: "https://math.berkeley.edu/programs/undergraduate/major",
    sourceType: RequirementSourceType.DEPARTMENT_PAGE,
    parserKey: "berkeley-generic-dept",
    label: "Mathematics major requirements"
  }
];

export function getSupplementarySourcesForProgram(input: {
  slug: string;
  name: string;
  code: string;
}) {
  return berkeleySupplementarySources.filter(
    (entry) =>
      entry.programSlug === input.slug ||
      entry.programCode === input.code ||
      (entry.programNameMatch && input.name.toLowerCase().includes(entry.programNameMatch.toLowerCase()))
  );
}
