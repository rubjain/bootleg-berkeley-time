"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToPlanButton } from "@/components/add-to-plan-button";
import { Badge } from "@/components/badge";
import type { TermDetail } from "@/lib/types";

type TermOfferingsExplorerProps = {
  termId: string;
  offerings: TermDetail["offerings"];
};

function formatMeetingTime(start?: string | null, end?: string | null) {
  if (!start || !end) return null;
  return `${start}–${end}`;
}

export function TermOfferingsExplorer({ termId, offerings }: TermOfferingsExplorerProps) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");

  const departments = useMemo(
    () => [...new Set(offerings.map((offering) => offering.departmentCode))].sort(),
    [offerings]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return offerings.filter((offering) => {
      if (department && offering.departmentCode !== department) return false;
      if (!normalized) return true;
      return [
        offering.courseCode,
        offering.courseTitle,
        offering.instructorText ?? "",
        offering.departmentCode,
        offering.location ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [offerings, query, department]);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by course, instructor, or location..."
            className="w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] outline-none focus:border-[#2f6f6a]"
          />
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] md:max-w-xs"
          >
            <option value="">All departments</option>
            {departments.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-sm text-[#6a7383]">
          Showing {filtered.length} of {offerings.length} offering{offerings.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length ? (
        <div className="grid gap-4">
          {filtered.map((offering) => {
            const meetingTime = formatMeetingTime(offering.timeStart, offering.timeEnd);
            const fillPercent =
              offering.capacity && offering.enrolled != null
                ? Math.round((offering.enrolled / offering.capacity) * 100)
                : null;

            return (
              <article
                key={offering.id}
                className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{offering.departmentCode}</Badge>
                      {offering.sectionCode ? <Badge>Sec {offering.sectionCode}</Badge> : null}
                      {offering.component ? <Badge>{offering.component}</Badge> : null}
                    </div>
                    <Link
                      href={`/courses/${offering.courseSlug}`}
                      className="mt-2 block text-xl font-semibold text-[#19212f] transition hover:text-[#1d6b6d]"
                    >
                      {offering.courseCode}
                    </Link>
                    <p className="mt-1 text-sm text-[#6a7383]">{offering.courseTitle}</p>
                  </div>
                  <Badge tone={offering.status === "PROJECTED" ? "projected" : "official"}>{offering.status}</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-[#4b5668] sm:grid-cols-2 lg:grid-cols-4">
                  <p>
                    <span className="font-medium text-[#19212f]">Instructor:</span> {offering.instructorText ?? "TBA"}
                  </p>
                  <p>
                    <span className="font-medium text-[#19212f]">Schedule:</span>{" "}
                    {offering.meetingDays && meetingTime
                      ? `${offering.meetingDays} ${meetingTime}`
                      : offering.meetingDays ?? meetingTime ?? "TBA"}
                  </p>
                  <p>
                    <span className="font-medium text-[#19212f]">Location:</span> {offering.location ?? "TBA"}
                  </p>
                  <p>
                    <span className="font-medium text-[#19212f]">Enrollment:</span>{" "}
                    {offering.enrolled ?? "—"}/{offering.capacity ?? "—"}
                    {offering.waitlist ? ` · ${offering.waitlist} waitlisted` : ""}
                  </p>
                </div>

                {fillPercent != null ? (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-[#6a7383]">
                      <span>Fill rate</span>
                      <span>{fillPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(36,48,71,0.08)]">
                      <div
                        className={`h-full rounded-full ${fillPercent >= 95 ? "bg-[#c96f4a]" : "bg-[#2f6f6a]"}`}
                        style={{ width: `${Math.min(fillPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {offering.projectedReason ? (
                  <p className="mt-4 rounded-2xl border border-[rgba(201,111,74,0.2)] bg-[rgba(201,111,74,0.08)] px-4 py-3 text-sm text-[#6f4038]">
                    {offering.projectedReason}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <AddToPlanButton courseId={offering.courseId} termId={termId} />
                  <Link
                    href={`/courses/${offering.courseSlug}`}
                    className="text-sm font-medium text-[#1d6b6d] underline-offset-2 hover:underline"
                  >
                    View course details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-8 text-center text-sm text-[#6a7383]">
          No offerings match this filter.
        </div>
      )}
    </div>
  );
}
