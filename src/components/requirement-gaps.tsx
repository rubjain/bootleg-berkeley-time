import Link from "next/link";
import { RequirementProgressSummary } from "@/lib/types";

type RequirementGapsProps = {
  progress: RequirementProgressSummary[];
};

export function RequirementGaps({ progress }: RequirementGapsProps) {
  const gaps = progress.flatMap((program) =>
    program.categories
      .filter((category) => category.remainingRuleTitles.length > 0)
      .map((category) => ({
        programName: program.programName,
        categoryTitle: category.title,
        remaining: category.remainingRuleTitles.slice(0, 3)
      }))
  );

  if (!gaps.length) {
    return (
      <p className="text-sm text-[#6a7383]">No open requirement gaps detected for your current plan.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {gaps.slice(0, 6).map((gap) => (
        <div
          key={`${gap.programName}-${gap.categoryTitle}`}
          className="rounded-2xl border border-[rgba(39,50,71,0.1)] bg-[rgba(255,252,246,0.72)] p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a3f20]">{gap.programName}</p>
          <h3 className="mt-2 font-semibold text-[#19212f]">{gap.categoryTitle}</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#4b5668]">
            {gap.remaining.map((rule) => (
              <li key={rule}>· {rule}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/programs" className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
              View programs
            </Link>
            <Link href="/planner" className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline">
              Update planner
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
