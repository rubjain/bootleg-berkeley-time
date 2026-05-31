import Link from "next/link";

type DataCoverageBannerProps = {
  courseCount: number;
  programCount: number;
  thresholdCourses?: number;
};

export function DataCoverageBanner({
  courseCount,
  programCount,
  thresholdCourses = 500
}: DataCoverageBannerProps) {
  if (courseCount >= thresholdCourses) return null;

  return (
    <div className="mb-6 rounded-[1.75rem] border border-[rgba(201,111,74,0.25)] bg-[rgba(201,111,74,0.08)] p-5 text-sm leading-6 text-[#6f4038]">
      Catalog sync is still in progress ({courseCount} courses, {programCount} programs loaded). Some courses
      and majors may show partial requirement data until the official Berkeley catalog import completes.
    </div>
  );
}

export function AdminCoverageLink() {
  return (
    <Link href="/admin/imports" className="font-semibold text-[#1d6b6d] underline">
      Admin imports
    </Link>
  );
}
