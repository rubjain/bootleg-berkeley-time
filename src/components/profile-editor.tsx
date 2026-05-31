"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ProgramSelectionType } from "@prisma/client";
import { Badge } from "@/components/badge";

type ProgramOption = {
  id: string;
  name: string;
  type: string;
};

type ProfileEditorProps = {
  programs: ProgramOption[];
  selectedPrograms: Array<{
    id: string;
    name: string;
    selectionType: string;
  }>;
  completedCourses: Array<{
    id: string;
    code: string;
    title: string;
    grade?: string;
  }>;
  courseOptions: Array<{
    id: string;
    code: string;
    title: string;
  }>;
};

export function ProfileEditor({
  programs,
  selectedPrograms,
  completedCourses,
  courseOptions
}: ProfileEditorProps) {
  const router = useRouter();
  const [majorId, setMajorId] = useState(
    selectedPrograms.find((program) => program.selectionType === "PRIMARY_MAJOR")?.id ?? ""
  );
  const [minorId, setMinorId] = useState(
    selectedPrograms.find((program) => program.selectionType === "MINOR")?.id ?? ""
  );
  const [courseToAdd, setCourseToAdd] = useState(courseOptions[0]?.id ?? "");
  const [grade, setGrade] = useState("A");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const majors = programs.filter((program) => program.type === "MAJOR");
  const minors = programs.filter((program) => program.type === "MINOR");

  function savePrograms() {
    const selections: Array<{
      programId: string;
      selectionType: ProgramSelectionType;
      isPrimary: boolean;
    }> = [];
    if (majorId) {
      selections.push({ programId: majorId, selectionType: ProgramSelectionType.PRIMARY_MAJOR, isPrimary: true });
    }
    if (minorId) {
      selections.push({ programId: minorId, selectionType: ProgramSelectionType.MINOR, isPrimary: false });
    }

    startTransition(async () => {
      setStatus(null);
      const response = await fetch("/api/user/program-selections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections })
      });
      setStatus(response.ok ? "Programs updated." : "Could not update programs.");
      router.refresh();
    });
  }

  function addCompletedCourse() {
    if (!courseToAdd) return;

    startTransition(async () => {
      setStatus(null);
      const response = await fetch("/api/user/course-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseToAdd, grade })
      });
      setStatus(response.ok ? "Course history updated." : "Could not update course history.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#19212f]">Programs</h2>
        <p className="mt-2 text-sm text-[#6a7383]">These drive requirement progress and recommendations.</p>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-[#314056]">
            Primary major
            <select
              value={majorId}
              onChange={(event) => setMajorId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-3 text-sm"
            >
              <option value="">Select a major</option>
              {majors.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[#314056]">
            Minor (optional)
            <select
              value={minorId}
              onChange={(event) => setMinorId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-3 text-sm"
            >
              <option value="">No minor</option>
              {minors.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={pending}
            onClick={savePrograms}
            className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19212f] disabled:opacity-60"
          >
            Save programs
          </button>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#19212f]">Completed courses</h2>
        <p className="mt-2 text-sm text-[#6a7383]">Add classes you have already finished.</p>

        <div className="mt-4 space-y-3">
          {completedCourses.map((course) => (
            <div key={course.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[rgba(36,48,71,0.05)] p-4">
              <div>
                <p className="font-semibold text-[#19212f]">{course.code}</p>
                <p className="text-sm text-[#6a7383]">{course.title}</p>
              </div>
              {course.grade ? <Badge>{course.grade}</Badge> : null}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <select
            value={courseToAdd}
            onChange={(event) => setCourseToAdd(event.target.value)}
            className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-3 text-sm"
          >
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
          </select>
          <input
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-white px-4 py-3 text-sm"
            placeholder="Grade"
          />
          <button
            type="button"
            disabled={pending}
            onClick={addCompletedCourse}
            className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white hover:bg-[#19212f] disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </div>

      {status ? <p className="text-sm text-[#1d6b6d] lg:col-span-2">{status}</p> : null}
    </div>
  );
}
