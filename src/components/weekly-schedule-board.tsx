import type { PlannerWeeklyScheduleItem, PlannerWeeklyScheduleResult } from "@/lib/planner-schedule";
import { expandMeetingDays } from "@/lib/planner-schedule";

const weekdayColumns = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

type WeeklyScheduleBoardProps = {
  items: PlannerWeeklyScheduleItem[];
  conflicts?: PlannerWeeklyScheduleResult["conflicts"];
  focusTermLabel?: string;
};

function itemAppearsOnDay(item: PlannerWeeklyScheduleItem, day: (typeof weekdayColumns)[number]) {
  const expanded = expandMeetingDays(item.days);
  const dayKey = day === "Mon" ? "Mon" : day === "Tue" ? "Tue" : day === "Wed" ? "Wed" : day === "Thu" ? "Thu" : "Fri";
  return expanded.includes(dayKey);
}

export function WeeklyScheduleBoard({ items, conflicts = [], focusTermLabel }: WeeklyScheduleBoardProps) {
  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#19212f]">Weekly schedule</h2>
          <p className="mt-2 text-sm leading-6 text-[#6a7383]">
            Meeting times come from seeded CourseOffering records when the database is connected, with mock fallbacks offline. Conflicts highlight overlapping blocks in the focused semester.
          </p>
          {focusTermLabel ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6f6a]">
              Showing {focusTermLabel}
            </p>
          ) : null}
        </div>
        {conflicts.length ? (
          <div className="rounded-2xl border border-[rgba(180,74,58,0.25)] bg-[rgba(180,74,58,0.08)] px-4 py-3 text-sm text-[#8b3d32]">
            <p className="font-semibold">{conflicts.length} time conflict{conflicts.length === 1 ? "" : "s"}</p>
            <ul className="mt-2 space-y-1 text-[#6f4038]">
              {conflicts.map((conflict) => (
                <li key={conflict.courses.join("-")}>
                  {conflict.courses.join(" vs ")} on {conflict.days.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(47,111,106,0.2)] bg-[rgba(47,111,106,0.08)] px-4 py-3 text-sm text-[#2f6f6a]">
            No meeting conflicts detected
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {weekdayColumns.map((day) => (
          <div key={day} className="rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6a7383]">{day}</h3>
            <div className="mt-3 space-y-3">
              {items.filter((item) => itemAppearsOnDay(item, day)).length ? (
                items
                  .filter((item) => itemAppearsOnDay(item, day))
                  .map((item) => (
                    <div
                      key={`${day}-${item.id}`}
                      className={`rounded-2xl border p-3 shadow-sm ${
                        item.conflictWith?.length
                          ? "border-[rgba(180,74,58,0.35)] bg-[rgba(180,74,58,0.06)]"
                          : "border-[rgba(39,50,71,0.08)] bg-white"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#19212f]">{item.title}</p>
                      {item.sectionLabel ? (
                        <p className="mt-0.5 text-xs text-[#6a7383]">{item.sectionLabel}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-[#4b5668]">{item.time ?? "Time TBA"}</p>
                      <p className="mt-1 text-xs text-[#6a7383]">{item.location ?? "Location TBA"}</p>
                      {item.conflictWith?.length ? (
                        <p className="mt-2 text-xs font-medium text-[#8b3d32]">
                          Conflicts with {item.conflictWith.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  ))
              ) : (
                <p className="text-sm text-[#9aa3b2]">No meetings</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
