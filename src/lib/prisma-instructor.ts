/** Instructor fields present after `rmpProfessorId` migration; use until `prisma generate` is rerun. */
export type InstructorRmpFields = {
  rmpProfessorId?: string | null;
};

export function getInstructorRmpProfessorId(instructor: InstructorRmpFields) {
  return instructor.rmpProfessorId ?? undefined;
}
