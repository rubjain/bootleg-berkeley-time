import { CourseDetail } from "@/lib/types";

export function CourseOverviewPanel({ course }: { course: CourseDetail }) {
  return (
    <div className="space-y-6">
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
