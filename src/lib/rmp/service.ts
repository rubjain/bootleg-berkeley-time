import { unstable_cache } from "next/cache";
import { RMPClient, type Professor } from "ratemyprofessors-client";
import { getInstructorRmpAlias } from "@/lib/instructor-rmp-aliases";
import { pickBestRmpProfessor } from "@/lib/rmp/match";
import { RMP_CACHE_SECONDS, UC_BERKELEY_RMP_SCHOOL_ID, rmpProfessorProfileUrl } from "@/lib/rmp/constants";

export type LiveRmpRating = {
  professorId: string;
  displayName: string;
  department?: string;
  overall: number;
  difficulty: number;
  reviewCount: number;
  wouldTakeAgainPercent?: number;
  sourceUrl: string;
  fetchedAt: string;
};

function departmentHintFromCode(departmentCode?: string) {
  if (!departmentCode) return undefined;
  const hints: Record<string, string> = {
    COMPSCI: "Computer Science",
    DATA: "Data Science",
    STAT: "Statistics",
    MATH: "Mathematics",
    ECON: "Economics",
    PHYSICS: "Physics",
    COGSCI: "Cognitive Science",
    ENGIN: "Engineering",
    UGBA: "Business",
    IB: "Biology"
  };
  return hints[departmentCode] ?? departmentCode;
}

function mapProfessor(professor: Professor): LiveRmpRating {
  return {
    professorId: professor.id,
    displayName: professor.name,
    department: professor.department ?? undefined,
    overall: professor.overall_rating ?? 0,
    difficulty: professor.level_of_difficulty ?? 0,
    reviewCount: professor.num_ratings ?? 0,
    wouldTakeAgainPercent:
      professor.percent_take_again != null && professor.percent_take_again >= 0
        ? professor.percent_take_again
        : undefined,
    sourceUrl: rmpProfessorProfileUrl(professor.id),
    fetchedAt: new Date().toISOString()
  };
}

async function fetchProfessorById(professorId: string) {
  const client = new RMPClient();
  try {
    const professor = await client.getProfessor(professorId);
    if (!professor) return null;
    return mapProfessor(professor);
  } finally {
    await client.close();
  }
}

async function searchProfessorLive(
  searchName: string,
  departmentCode?: string
): Promise<LiveRmpRating | null> {
  const client = new RMPClient();
  try {
    const departmentHint = departmentHintFromCode(departmentCode);
    const result = await client.searchProfessors(searchName, {
      school_id: UC_BERKELEY_RMP_SCHOOL_ID,
      page_size: 8
    });

    const berkeleyMatches = result.professors.filter(
      (professor) => professor.school?.id === UC_BERKELEY_RMP_SCHOOL_ID
    );
    const best = pickBestRmpProfessor(berkeleyMatches, searchName, departmentHint);
    if (!best) return null;

    if ((best.num_ratings ?? 0) === 0) {
      const full = await client.getProfessor(best.id);
      if (full) return mapProfessor(full);
    }

    return mapProfessor(best);
  } finally {
    await client.close();
  }
}

const cachedLookup = unstable_cache(
  async (cacheKey: string, searchName: string, departmentCode?: string, professorId?: string) => {
    if (professorId) {
      const byId = await fetchProfessorById(professorId);
      if (byId) return byId;
    }
    return searchProfessorLive(searchName, departmentCode);
  },
  ["rmp-professor-lookup"],
  { revalidate: RMP_CACHE_SECONDS }
);

export async function lookupLiveRmpRating(input: {
  slug: string;
  name: string;
  departmentCode?: string;
  rmpProfessorId?: string | null;
}): Promise<LiveRmpRating | null> {
  const alias = getInstructorRmpAlias(input.slug);
  const searchName = alias?.searchName ?? input.name;
  const professorId = input.rmpProfessorId ?? alias?.rmpProfessorId;
  const cacheKey = `${input.slug}:${searchName}:${professorId ?? "search"}:${input.departmentCode ?? ""}`;

  try {
    return await cachedLookup(cacheKey, searchName, input.departmentCode, professorId);
  } catch {
    return null;
  }
}

export async function lookupLiveRmpRatingByName(name: string, departmentCode?: string) {
  const cacheKey = `name:${name}:${departmentCode ?? ""}`;
  try {
    return await cachedLookup(cacheKey, name, departmentCode);
  } catch {
    return null;
  }
}
