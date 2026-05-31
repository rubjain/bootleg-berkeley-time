import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/badge";
import { InstructorProfile } from "@/lib/types";

export function ProfessorRatingCard({ instructor }: { instructor: InstructorProfile }) {
  const rating = instructor.rating;

  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/instructors/${instructor.slug}`} className="text-lg font-semibold text-[#19212f] hover:underline">
            {instructor.name}
          </Link>
          <p className="mt-1 text-sm text-[#6a7383]">
            {instructor.departmentName ?? instructor.departmentCode ?? "Berkeley faculty"}
            {instructor.role ? ` · ${instructor.role}` : ""}
          </p>
        </div>
        {rating ? (
          <div className="flex items-center gap-2 rounded-full bg-[rgba(201,111,74,0.12)] px-3 py-1.5">
            <Star className="h-4 w-4 fill-[#c96f4a] text-[#c96f4a]" />
            <span className="text-sm font-semibold text-[#8a3f20]">{rating.overall.toFixed(1)} / 5.0</span>
          </div>
        ) : null}
      </div>

      {rating ? (
        <RatingBody instructor={instructor} rating={rating} />
      ) : (
        <p className="mt-4 text-sm text-[#6a7383]">No live Rate My Professors rating found for this instructor yet.</p>
      )}
    </div>
  );
}

function RatingBody({ instructor, rating }: { instructor: InstructorProfile; rating: NonNullable<InstructorProfile["rating"]> }) {
  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[rgba(36,48,71,0.06)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a6d61]">Overall quality</p>
          <p className="mt-2 text-2xl font-semibold text-[#19212f]">{rating.overall.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl bg-[rgba(36,48,71,0.04)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a6d61]">Difficulty</p>
          <p className="mt-2 text-2xl font-semibold text-[#19212f]">{rating.difficulty.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl bg-[rgba(36,48,71,0.04)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7a6d61]">Reviews</p>
          <p className="mt-2 text-2xl font-semibold text-[#19212f]">{rating.reviewCount}</p>
        </div>
      </div>

      {rating.summary ? <p className="mt-4 text-sm leading-7 text-[#4b5668]">{rating.summary}</p> : null}

      {rating.matchedName && rating.matchedName !== instructor.name ? (
        <p className="mt-4 text-xs text-[#6a7383]">
          Matched Rate My Professors profile: <span className="font-medium text-[#4b5668]">{rating.matchedName}</span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={rating.isLive ? "official" : "projected"}>
          {rating.isLive ? "Live from Rate My Professors" : rating.sourceName}
        </Badge>
        {rating.isLive && rating.fetchedAt ? (
          <Badge tone="neutral">Updated {new Date(rating.fetchedAt).toLocaleDateString()}</Badge>
        ) : null}
        {instructor.recentTerms.length ? (
          <Badge>Recent terms: {instructor.recentTerms.slice(0, 3).join(", ")}</Badge>
        ) : null}
      </div>

      {rating.sourceUrl ? (
        <a
          href={rating.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-[#1d6b6d] underline-offset-2 hover:underline"
        >
          View on Rate My Professors
        </a>
      ) : null}
    </>
  );
}