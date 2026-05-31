import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/badge";
import { InstructorSummary } from "@/lib/types";

export function InstructorCard({ instructor }: { instructor: InstructorSummary }) {
  const rating = instructor.rating;

  return (
    <Link
      href={`/instructors/${instructor.slug}`}
      className="group flex h-full flex-col rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(39,50,71,0.2)] hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-[#19212f] group-hover:text-[#1d6b6d]">{instructor.name}</h3>
        {rating ? (
          <div className="flex items-center gap-2 rounded-full bg-[rgba(201,111,74,0.12)] px-3 py-1.5">
            <Star className="h-4 w-4 fill-[#c96f4a] text-[#c96f4a]" />
            <span className="text-sm font-semibold text-[#8a3f20]">{rating.overall.toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-[#6a7383]">
        {instructor.departmentName ?? instructor.departmentCode ?? "Berkeley faculty"}
        {instructor.courseCount ? ` · ${instructor.courseCount} linked course${instructor.courseCount === 1 ? "" : "s"}` : ""}
      </p>

      {instructor.recentCourseCodes.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {instructor.recentCourseCodes.map((code) => (
            <Badge key={code}>{code}</Badge>
          ))}
        </div>
      ) : null}

      {rating ? (
        <p className="mt-auto flex items-center gap-2 pt-5 text-sm text-[#314056]">
          <Star className="h-4 w-4 fill-[#c96f4a] text-[#c96f4a]" />
          <span>
            {rating.overall.toFixed(1)} / 5.0 · {rating.reviewCount} reviews
            {rating.isLive ? " · Live RMP" : ""}
          </span>
        </p>
      ) : (
        <p className="mt-auto pt-5 text-sm text-[#6a7383]">No Rate My Professors rating yet</p>
      )}
    </Link>
  );
}
