import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/badge";
import { CourseSummary } from "@/lib/types";

export function CourseCard({ course }: { course: CourseSummary }) {
  const tone =
    course.dataTone === "official"
      ? "official"
      : course.dataTone === "projected"
        ? "projected"
        : course.dataTone === "placeholder"
          ? "warning"
          : "success";

  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(39,50,71,0.2)] hover:shadow-md">
      <Link href={`/courses/${course.slug}`} className="block">
        <CourseCardHeader course={course} tone={tone} />
      </Link>

      {course.descriptionPreview ? (
        <Link href={`/courses/${course.slug}`} className="mt-4 block">
          <p className="line-clamp-3 text-sm leading-6 text-[#4b5668]">{course.descriptionPreview}</p>
        </Link>
      ) : null}

      <Link href={`/courses/${course.slug}`} className="mt-4 block">
        <div className="flex flex-wrap gap-2">
          <Badge>{course.units}</Badge>
          <Badge>{course.level}</Badge>
          {course.breadthTags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </Link>

      <div className="mt-auto space-y-3 pt-5">
        <Link href={`/courses/${course.slug}`} className="block text-sm text-[#6a7383] hover:text-[#19212f]">
          {course.departmentName ?? course.departmentCode} · Offered: {course.termsOffered.join(", ") || "Limited data"}
        </Link>
        {course.topInstructorName && course.topInstructorRating ? (
          <p className="flex flex-wrap items-center gap-2 text-sm text-[#314056]">
            <Star className="h-4 w-4 fill-[#c96f4a] text-[#c96f4a]" />
            {course.topInstructorSlug ? (
              <Link
                href={`/instructors/${course.topInstructorSlug}`}
                className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline"
              >
                {course.topInstructorName}
              </Link>
            ) : (
              <span>{course.topInstructorName}</span>
            )}
            <span>· {course.topInstructorRating.toFixed(1)} on Rate My Professors</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

function CourseCardHeader({ course, tone }: { course: CourseSummary; tone: "official" | "projected" | "warning" | "success" }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a3f20]">{course.code}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#19212f] group-hover:text-[#1d6b6d]">{course.title}</h3>
      </div>
      <Badge tone={tone}>{course.fillRisk}</Badge>
    </div>
  );
}
