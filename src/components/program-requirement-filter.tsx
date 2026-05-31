"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/badge";
import type { CoursePickerOption, ProgramDetail } from "@/lib/types";

type ProgramRequirementFilterProps = {
  program: ProgramDetail;
  mappedCourses: CoursePickerOption[];
};

function formatRuleType(ruleType: string) {
  return ruleType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ProgramRequirementFilter({ program, mappedCourses }: ProgramRequirementFilterProps) {
  const [query, setQuery] = useState("");
  const mappedCourseByCode = useMemo(
    () => new Map(mappedCourses.map((course) => [course.code, course])),
    [mappedCourses]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
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
  }, [normalizedQuery, program.categories]);

  const visibleRuleCount = filteredCategories.reduce((sum, category) => sum + category.rules.length, 0);

  return (
    <div className="space-y-5">
      <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
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
          {normalizedQuery
            ? `${visibleRuleCount} matching rule${visibleRuleCount === 1 ? "" : "s"} across ${filteredCategories.length} categor${filteredCategories.length === 1 ? "y" : "ies"}`
            : `${program.categories.length} categories · ${program.categories.reduce((sum, category) => sum + category.rules.length, 0)} rules`}
        </p>
      </div>

      {filteredCategories.length ? (
        filteredCategories.map((category) => (
          <div
            key={category.id}
            className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-[#19212f]">{category.title}</h2>
            {category.description ? (
              <p className="mt-2 text-sm leading-6 text-[#6a7383]">{category.description}</p>
            ) : null}
            {category.rules.some((rule) => rule.courseCodes.length > 0) ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {[...new Set(category.rules.flatMap((rule) => rule.courseCodes))]
                  .slice(0, 12)
                  .map((courseCode) => {
                    const mappedCourse = mappedCourseByCode.get(courseCode);

                    return mappedCourse ? (
                      <Link
                        key={courseCode}
                        href={`/courses/${mappedCourse.slug}`}
                        className="rounded-full border border-[rgba(33,51,79,0.12)] bg-[#f7f4ee] px-3 py-1.5 text-sm font-medium text-[#19212f] transition hover:border-[#8a3f20] hover:text-[#8a3f20]"
                      >
                        {mappedCourse.code}
                      </Link>
                    ) : (
                      <Badge key={courseCode}>{courseCode}</Badge>
                    );
                  })}
              </div>
            ) : null}
            <div className="mt-5 grid gap-4">
              {category.rules.map((rule) => (
                <div key={rule.id} className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-[#19212f]">{rule.title}</h3>
                    <Badge>{formatRuleType(rule.ruleType)}</Badge>
                    {rule.minSelect ? <Badge>Choose {rule.minSelect}</Badge> : null}
                  </div>
                  {rule.description ? (
                    <p className="mt-2 text-sm leading-6 text-[#4b5668]">{rule.description}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rule.courseCodes.map((code) => {
                      const mappedCourse = mappedCourseByCode.get(code);
                      return mappedCourse ? (
                        <Link
                          key={code}
                          href={`/courses/${mappedCourse.slug}`}
                          className="rounded-full border border-[rgba(33,51,79,0.12)] bg-white px-3 py-1.5 text-sm font-medium text-[#19212f] transition hover:border-[#8a3f20] hover:text-[#8a3f20]"
                        >
                          {code}
                        </Link>
                      ) : (
                        <Badge key={code}>{code}</Badge>
                      );
                    })}
                  </div>
                  {rule.allowedDepartmentCodes.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rule.allowedDepartmentCodes.map((departmentCode) => (
                        <Badge key={departmentCode} tone="official">
                          Dept {departmentCode}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {rule.allowedTags.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rule.allowedTags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  ) : null}
                  {rule.sourceRefText ? (
                    <p className="mt-3 text-xs text-[#6a7383]">{rule.sourceRefText}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 text-sm text-[#6a7383]">
          No requirement rules match &ldquo;{query}&rdquo;. Try a course code, department, or rule keyword.
        </div>
      )}
    </div>
  );
}
