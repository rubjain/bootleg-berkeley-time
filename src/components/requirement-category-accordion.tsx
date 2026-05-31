"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/badge";
import type { CoursePickerOption, ProgramDetail } from "@/lib/types";

type RequirementCategoryAccordionProps = {
  categories: ProgramDetail["categories"];
  mappedCourses: CoursePickerOption[];
  filteredCategoryIds?: Set<string>;
};

function formatRuleType(ruleType: string) {
  return ruleType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ruleTypeIcon(ruleType: string) {
  if (ruleType === "REQUIRED_COURSE") return "●";
  if (ruleType === "CHOOSE_N_COURSES") return "◇";
  if (ruleType === "MIN_UNITS") return "◆";
  return "○";
}

export function RequirementCategoryAccordion({
  categories,
  mappedCourses,
  filteredCategoryIds
}: RequirementCategoryAccordionProps) {
  const mappedCourseByCode = new Map(mappedCourses.map((course) => [course.code, course]));
  const visible = filteredCategoryIds
    ? categories.filter((category) => filteredCategoryIds.has(category.id))
    : categories;
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(visible.slice(0, 2).map((c) => c.id)));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!visible.length) {
    return (
      <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 text-sm text-[#6a7383]">
        No requirement categories to display.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((category) => {
        const isOpen = openIds.has(category.id);
        const ruleCount = category.rules.length;
        const mappedCount = category.rules.reduce(
          (sum, rule) => sum + rule.courseCodes.filter((code) => mappedCourseByCode.has(code)).length,
          0
        );

        return (
          <div
            key={category.id}
            className="overflow-hidden rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggle(category.id)}
              className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-[rgba(36,48,71,0.03)]"
            >
              <div>
                <h2 className="text-lg font-semibold text-[#19212f]">{category.title}</h2>
                {category.description ? (
                  <p className="mt-1 text-sm leading-6 text-[#6a7383]">{category.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-lg text-[#1d6b6d]">{isOpen ? "−" : "+"}</span>
                <Badge>
                  {ruleCount} rule{ruleCount === 1 ? "" : "s"}
                </Badge>
                {mappedCount > 0 ? <Badge tone="official">{mappedCount} mapped</Badge> : null}
              </div>
            </button>

            {isOpen ? (
              <div className="border-t border-[rgba(39,50,71,0.08)] px-6 pb-6 pt-4">
                <div className="grid gap-4">
                  {category.rules.map((rule) => (
                    <div key={rule.id} className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[#1d6b6d]" aria-hidden>
                          {ruleTypeIcon(rule.ruleType)}
                        </span>
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
                            <Badge key={code} tone="warning">
                              {code}
                            </Badge>
                          );
                        })}
                      </div>
                      {rule.sourceRefText ? (
                        <p className="mt-3 text-xs text-[#6a7383]">{rule.sourceRefText}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
