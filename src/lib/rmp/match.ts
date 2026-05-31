import type { Professor } from "ratemyprofessors-client";

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameTokens(value: string) {
  return normalizeName(value).split(" ").filter(Boolean);
}

export function scoreRmpProfessorMatch(
  candidate: Professor,
  queryName: string,
  departmentHint?: string
) {
  const query = normalizeName(queryName);
  const candidateName = normalizeName(candidate.name);
  const queryParts = nameTokens(queryName);
  const candidateParts = nameTokens(candidate.name);

  let score = 0;

  if (candidateName === query) score += 120;
  if (queryParts.length >= 2) {
    const [first, last] = [queryParts[0], queryParts[queryParts.length - 1]];
    if (candidateParts[0] === first && candidateParts[candidateParts.length - 1] === last) {
      score += 90;
    }
    if (candidateName.includes(first) && candidateName.includes(last)) {
      score += 55;
    }
  }

  if (departmentHint && candidate.department) {
    const hint = departmentHint.toLowerCase();
    const department = candidate.department.toLowerCase();
    if (department.includes(hint) || hint.includes(department.split(" ")[0] ?? "")) {
      score += 25;
    }
  }

  if ((candidate.num_ratings ?? 0) > 0) score += Math.min(20, Math.log10((candidate.num_ratings ?? 0) + 1) * 8);
  if ((candidate.overall_rating ?? 0) > 0) score += 5;

  return score;
}

export function pickBestRmpProfessor(
  candidates: Professor[],
  queryName: string,
  departmentHint?: string
) {
  if (!candidates.length) return null;

  const ranked = [...candidates]
    .map((candidate) => ({
      candidate,
      score: scoreRmpProfessorMatch(candidate, queryName, departmentHint)
    }))
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  if (!best || best.score < 40) return null;
  return best.candidate;
}
