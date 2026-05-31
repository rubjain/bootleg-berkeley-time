"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { ProgramRequirementsView } from "@/components/program-requirements-view";
import { ProgramRequirementFilter } from "@/components/program-requirement-filter";
import { ProgramSourcesPanel } from "@/components/program-sources-panel";
import type { CoursePickerOption, ProgramDetail } from "@/lib/types";
import type { OfficialRequirementAudit } from "@/lib/program-advising";

type ProgramDetailTabsProps = {
  program: ProgramDetail;
  mappedCourses: CoursePickerOption[];
  audit?: OfficialRequirementAudit | null;
};

const tabs = ["Requirements", "Courses", "Sources", "Advising"] as const;

export function ProgramDetailTabs({ program, mappedCourses, audit }: ProgramDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Requirements");
  const [useAccordion, setUseAccordion] = useState(true);
  const showAdvisingFallback = Boolean(audit) && program.categories.length < 3;

  const courseCards = useMemo(() => {
    const codes = new Set(
      program.categories.flatMap((category) => category.rules.flatMap((rule) => rule.courseCodes))
    );
    return mappedCourses.filter((course) => codes.has(course.code));
  }, [mappedCourses, program.categories]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[rgba(39,50,71,0.12)] pb-4">
        {tabs.map((tab) => {
          if (tab === "Advising" && !showAdvisingFallback) return null;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-[#1d6b6d] text-white"
                  : "bg-[rgba(36,48,71,0.06)] text-[#4b5668] hover:bg-[rgba(36,48,71,0.1)]"
              }`}
            >
              {tab}
            </button>
          );
        })}
        {activeTab === "Requirements" ? (
          <button
            type="button"
            onClick={() => setUseAccordion((value) => !value)}
            className="ml-auto rounded-full border border-[rgba(39,50,71,0.12)] px-3 py-1.5 text-xs font-medium text-[#4b5668]"
          >
            {useAccordion ? "List view" : "Accordion view"}
          </button>
        ) : null}
      </div>

      {activeTab === "Requirements" ? (
        <ProgramRequirementsView program={program} mappedCourses={mappedCourses} useAccordion={useAccordion} />
      ) : null}

      {activeTab === "Courses" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {courseCards.length ? (
            courseCards.map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`}>
                <CourseCard
                  course={{
                    id: course.id,
                    code: course.code,
                    slug: course.slug,
                    title: course.title,
                    departmentCode: course.departmentCode,
                    units: "—",
                    level: "—",
                    requirementTags: [],
                    breadthTags: [],
                    termsOffered: [],
                    fillRisk: "—",
                    dataTone: "official"
                  }}
                />
              </Link>
            ))
          ) : (
            <p className="text-sm text-[#6a7383]">No mapped courses yet for this program&apos;s requirements.</p>
          )}
        </div>
      ) : null}

      {activeTab === "Sources" ? <ProgramSourcesPanel sources={program.requirementSources} /> : null}

      {activeTab === "Advising" && audit && showAdvisingFallback ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdvisingBlock title="Lower-division planning" items={audit.lowerDivision} />
          <AdvisingBlock title="Upper-division planning" items={audit.upperDivision} />
          <AdvisingBlock title="Electives and option groups" items={audit.electives} />
          <AdvisingBlock title="Clear advising notes" items={audit.advisingNotes} />
        </div>
      ) : null}
    </div>
  );
}

function AdvisingBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#19212f]">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-6 text-[#4b5668]">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}
