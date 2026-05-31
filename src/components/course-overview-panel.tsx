import { Badge } from "@/components/badge";
import { CourseDetail } from "@/lib/types";

export function CourseOverviewPanel({ course }: { course: CourseDetail }) {
  const catalogSearchUrl = `https://undergraduate.catalog.berkeley.edu/search?P=${encodeURIComponent(course.code)}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[rgba(47,111,106,0.2)] bg-[rgba(47,111,106,0.06)] p-6 shadow-sm">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#1d6b6d]">Official catalog</p>
        <p className="mt-3 text-sm leading-7 text-[#4b5668]">
          <strong className="text-[#19212f]">Prerequisites:</strong>{" "}
          {course.prerequisitesText ?? course.catalogDetail.prerequisitesNote}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {course.breadthTags.map((tag) => (
            <Badge key={tag} tone="official">
              {tag}
            </Badge>
          ))}
          {course.requirementTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <a
          href={catalogSearchUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-[#1d6b6d] underline"
        >
          View on UC Berkeley Undergraduate Catalog
        </a>
      </section>

      <section className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8a3f20]">Course description</p>
        <p className="mt-4 text-base leading-8 text-[#4b5668]">{course.description}</p>
        <p className="mt-4 text-sm text-[#6a7383]">
          {course.departmentName ?? course.departmentCode} · {course.level} · {course.units}
        </p>
      </section>

      <section className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8a3f20]">What you will learn</p>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-[#4b5668]">
          {course.catalogDetail.learningOutcomes.map((outcome) => (
            <li key={outcome}>· {outcome}</li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8a3f20]">Workload</p>
          <p className="mt-4 text-sm leading-7 text-[#4b5668]">{course.catalogDetail.workloadNotes}</p>
        </section>
        <section className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#8a3f20]">Assessment style</p>
          <p className="mt-4 text-sm leading-7 text-[#4b5668]">{course.catalogDetail.assessmentStyle}</p>
        </section>
      </div>
    </div>
  );
}
