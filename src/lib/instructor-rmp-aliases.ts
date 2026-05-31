/**
 * Optional overrides when the catalog instructor name does not match RMP listings well.
 * Prefer updating seed names to real Berkeley faculty when possible.
 */
export type InstructorRmpAlias = {
  searchName?: string;
  rmpProfessorId?: string;
};

export const instructorRmpAliases: Record<string, InstructorRmpAlias> = {
  "jennifer-wang": { searchName: "Dan Garcia", rmpProfessorId: "142865" },
  "miguel-alvarez": { searchName: "Josh Hug", rmpProfessorId: "2039180" },
  "noah-kim": { searchName: "Nicholas Weaver", rmpProfessorId: "2374426" },
  "ava-sullivan": { searchName: "John DeNero", rmpProfessorId: "1621181" },
  "rohan-mehta": { searchName: "Joseph Gonzalez", rmpProfessorId: "3015291" },
  "sara-lopez": { searchName: "Michael Jordan", rmpProfessorId: "521380" },
  "lila-foster": { searchName: "Alexander Paulin", rmpProfessorId: "2335479" },
  "ethan-park": { searchName: "Terry Regier", rmpProfessorId: "1881686" },
  "grace-liu": { searchName: "Christina Romer", rmpProfessorId: "38534" },
  "olivia-hart": { searchName: "Richard Muller", rmpProfessorId: "154383" },
  "marcus-reed": { searchName: "Kameshwar Poolla", rmpProfessorId: "725865" },
  "daniel-brooks": { searchName: "Gregory La Blanc", rmpProfessorId: "779777" },
  "priya-shah": { searchName: "Gregory La Blanc", rmpProfessorId: "779777" }
};

export function getInstructorRmpAlias(slug: string) {
  return instructorRmpAliases[slug];
}
