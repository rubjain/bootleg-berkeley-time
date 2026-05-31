import { ProfessorRatingCard } from "@/components/professor-rating-card";
import { InstructorProfile } from "@/lib/types";

export function InstructorList({ instructors, summary }: { instructors: InstructorProfile[]; summary: string }) {
  if (!instructors.length) {
    return (
      <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 text-sm text-[#6a7383]">
        No instructor records are linked to recent offerings for this course yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-[rgba(29,107,109,0.18)] bg-[rgba(29,107,109,0.08)] p-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#1d6b6d]">Rate My Professors</p>
        <p className="mt-3 text-sm leading-7 text-[#4b5668]">{summary}</p>
        <p className="mt-3 text-xs text-[#6a7383]">
          Ratings are fetched live from Rate My Professors for UC Berkeley and cached for 24 hours. If a listing cannot be found, seeded fallback data may appear.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {instructors.map((instructor) => (
          <ProfessorRatingCard key={instructor.id} instructor={instructor} />
        ))}
      </div>
    </div>
  );
}
