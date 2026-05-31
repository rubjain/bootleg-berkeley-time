"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/badge";
import { CourseSummary, PlanDetailView } from "@/lib/types";

export function PlannerBoard({
  plan,
  courseOptions
}: {
  plan: PlanDetailView;
  courseOptions: CourseSummary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedSemesterId, setSelectedSemesterId] = useState(plan.semesters[0]?.id ?? "");
  const [selectedCourseId, setSelectedCourseId] = useState(courseOptions[0]?.id ?? "");
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);

  const selectedCourse = useMemo(
    () => courseOptions.find((course) => course.id === selectedCourseId),
    [courseOptions, selectedCourseId]
  );

  const semesterOrder = plan.semesters.map((semester) => semester.id);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#19212f]">Add a class to this plan</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1.25fr_1fr_auto]">
          <select
            value={selectedCourseId}
            onChange={(event) => setSelectedCourseId(event.target.value)}
            className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] outline-none focus:border-[#2f6f6a]"
          >
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          <select
            value={selectedSemesterId}
            onChange={(event) => setSelectedSemesterId(event.target.value)}
            className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(247,243,235,0.7)] px-4 py-3 text-sm text-[#19212f] outline-none focus:border-[#2f6f6a]"
          >
            {plan.semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending || !selectedCourse}
            onClick={() =>
              startTransition(async () => {
                await fetch(`/api/plans/${plan.id}/courses`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    semesterId: selectedSemesterId,
                    courseId: selectedCourseId
                  })
                });
                router.refresh();
              })
            }
            className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f]"
          >
            {pending ? "Saving..." : "Add course"}
          </button>
        </div>
        {selectedCourse ? (
          <p className="mt-3 text-sm text-[#6a7383]">
            {selectedCourse.level} · {selectedCourse.units} · {selectedCourse.fillRisk}
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
        <div className="grid min-w-[980px] grid-cols-4 gap-4">
          {plan.semesters.map((semester) => (
            <div
              key={semester.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const plannedCourseId = event.dataTransfer.getData("text/plannedCourseId") || draggedCourseId;
                if (!plannedCourseId) return;

                startTransition(async () => {
                  await fetch(`/api/plans/${plan.id}/courses`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      plannedCourseId,
                      destinationSemesterId: semester.id
                    })
                  });
                  setDraggedCourseId(null);
                  router.refresh();
                });
              }}
              className="rounded-3xl bg-[rgba(36,48,71,0.05)] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6a7383]">{semester.label}</h2>
                <Badge>{semester.totalUnits}/{semester.unitsTarget ?? 15} units</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {semester.courses.length > 0 ? (
                  semester.courses.map((course) => {
                    const currentIndex = semesterOrder.indexOf(semester.id);
                    const previousSemesterId = semesterOrder[currentIndex - 1];
                    const nextSemesterId = semesterOrder[currentIndex + 1];

                    return (
                      <div
                        key={course.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plannedCourseId", course.id);
                          setDraggedCourseId(course.id);
                        }}
                        className="rounded-2xl border border-[rgba(39,50,71,0.08)] bg-white p-3 shadow-sm"
                      >
                        <p className="text-sm font-semibold text-[#19212f]">{course.courseCode}</p>
                        <p className="mt-1 text-xs text-[#6a7383]">{course.courseTitle}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge>{course.units} units</Badge>
                          {course.warnings.slice(0, 1).map((warning) => (
                            <Badge key={warning} tone="projected">{warning}</Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={!previousSemesterId || pending}
                            onClick={() =>
                              previousSemesterId
                                ? startTransition(async () => {
                                    await fetch(`/api/plans/${plan.id}/courses`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        plannedCourseId: course.id,
                                        destinationSemesterId: previousSemesterId
                                      })
                                    });
                                    router.refresh();
                                  })
                                : undefined
                            }
                            className="rounded-full bg-[rgba(36,48,71,0.06)] px-3 py-1 text-xs font-medium text-[#314056] disabled:opacity-40"
                          >
                            Move earlier
                          </button>
                          <button
                            type="button"
                            disabled={!nextSemesterId || pending}
                            onClick={() =>
                              nextSemesterId
                                ? startTransition(async () => {
                                    await fetch(`/api/plans/${plan.id}/courses`, {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        plannedCourseId: course.id,
                                        destinationSemesterId: nextSemesterId
                                      })
                                    });
                                    router.refresh();
                                  })
                                : undefined
                            }
                            className="rounded-full bg-[rgba(36,48,71,0.06)] px-3 py-1 text-xs font-medium text-[#314056] disabled:opacity-40"
                          >
                            Move later
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              startTransition(async () => {
                                await fetch(`/api/plans/${plan.id}/courses`, {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    plannedCourseId: course.id
                                  })
                                });
                                router.refresh();
                              })
                            }
                            className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-[rgba(39,50,71,0.2)] bg-white p-3 text-sm text-[#6a7383]">
                    Drop a course here or add one from the picker above.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
