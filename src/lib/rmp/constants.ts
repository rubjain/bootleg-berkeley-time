/** Legacy Rate My Professors school id for University of California Berkeley. */
export const UC_BERKELEY_RMP_SCHOOL_ID = "1072";

export const RMP_CACHE_SECONDS = 60 * 60 * 24;

export function rmpProfessorProfileUrl(professorId: string) {
  return `https://www.ratemyprofessors.com/professor/${professorId}`;
}
