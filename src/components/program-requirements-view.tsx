"use client";

import { useMemo, useState } from "react";
import { ProgramRequirementFilter } from "@/components/program-requirement-filter";
import { RequirementCategoryAccordion } from "@/components/requirement-category-accordion";
import type { CoursePickerOption, ProgramDetail } from "@/lib/types";

type ProgramRequirementsViewProps = {
  program: ProgramDetail;
  mappedCourses: CoursePickerOption[];
  useAccordion?: boolean;
};

function filterCategories(program: ProgramDetail, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return program.categories;

  return program.categories
    .map((category) => {
      const categoryMatches =
        category.title.toLowerCase().includes(normalizedQuery) ||
        category.description?.toLowerCase().includes(normalizedQuery);

      const rules = category.rules.filter((rule) => {
        if (categoryMatches) return true;
        return (
          rule.title.toLowerCase().includes(normalizedQuery) ||
          rule.description?.toLowerCase().includes(normalizedQuery) ||
          rule.courseCodes.some((code) => code.toLowerCase().includes(normalizedQuery)) ||
          rule.allowedDepartmentCodes.some((code) => code.toLowerCase().includes(normalizedQuery)) ||
          rule.allowedTags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
        );
      });

      return { ...category, rules };
    })
    .filter((category) => category.rules.length > 0);
}

export function ProgramRequirementsView({ program, mappedCourses, useAccordion = true }: ProgramRequirementsViewProps) {
  const [query, setQuery] = useState("");
  const filteredCategories = useMemo(() => filterCategories(program, query), [program, query]);
  const filteredIds = useMemo(() => new Set(filteredCategories.map((c) => c.id)), [filteredCategories]);

  if (!useAccordion) {
    return <ProgramRequirementFilter program={program} mappedCourses={mappedCourses} />;
  }

  const visibleRuleCount = filteredCategories.reduce((sum, category) => sum + category.rules.length, 0);

  return (
    <div className="space-y-5">
      <div className="sticky top-4 z-10 rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.95)] p-5 shadow-sm backdrop-blur">
        <label htmlFor="program-requirement-search" className="text-sm font-semibold text-[#19212f]">
          Search requirements and mapped courses
        </label>
        <input
          id="program-requirement-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by course code, rule title, department, or tag…"
          className="mt-3 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-3 text-sm text-[#19212f] outline-none ring-[#2f6f6a] placeholder:text-[#9aa3b2] focus:ring-2"
        />
        <p className="mt-2 text-sm text-[#6a7383]">
          {query.trim()
            ? `${visibleRuleCount} matching rule${visibleRuleCount === 1 ? "" : "s"} across ${filteredCategories.length} categor${filteredCategories.length === 1 ? "y" : "ies"}`
            : `${program.categories.length} categories · ${program.categories.reduce((sum, category) => sum + category.rules.length, 0)} rules`}
        </p>
      </div>

      <RequirementCategoryAccordion
        categories={program.categories}
        mappedCourses={mappedCourses}
        filteredCategoryIds={query.trim() ? filteredIds : undefined}
      />
    </div>
  );
}
