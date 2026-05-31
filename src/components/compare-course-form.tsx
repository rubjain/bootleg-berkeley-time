"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoursePickerOption } from "@/lib/types";

type CompareCourseFormProps = {
  leftDefault?: string;
  rightDefault?: string;
  options: CoursePickerOption[];
  featuredPairs: Array<{
    label: string;
    left: string;
    right: string;
  }>;
};

export function CompareCourseForm({ leftDefault = "", rightDefault = "", options, featuredPairs }: CompareCourseFormProps) {
  const router = useRouter();
  const [left, setLeft] = useState(leftDefault);
  const [right, setRight] = useState(rightDefault);
  const datalistId = "course-compare-options";

  function resolveCourseTarget(value: string) {
    const normalized = value.trim().toLowerCase();
    const match = options.find((option) => {
      const combinedLabel = `${option.code} - ${option.title}`.toLowerCase();
      return [option.slug, option.id, option.code.toLowerCase(), combinedLabel].includes(normalized);
    });

    return match?.slug ?? value.trim();
  }

  return (
    <div className="rounded-[2rem] border border-[rgba(33,51,79,0.12)] bg-[rgba(255,255,255,0.82)] p-5 shadow-[0_22px_70px_rgba(47,44,37,0.08)] backdrop-blur-sm md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8a3f20]">Live catalog compare</p>
          <h2 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-3xl tracking-[-0.03em] text-[#19212f]">
            Pick real Berkeley courses, not hidden slugs
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-[#546071]">
          Start typing a course code or title. The compare page now resolves directly against the live seeded catalog.
        </p>
      </div>

      <form
        className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!left || !right) return;

          const leftTarget = resolveCourseTarget(left);
          const rightTarget = resolveCourseTarget(right);
          router.push(`/compare?left=${encodeURIComponent(leftTarget)}&right=${encodeURIComponent(rightTarget)}`);
        }}
      >
        <input
          list={datalistId}
          value={left}
          onChange={(event) => setLeft(event.target.value)}
          placeholder="COMPSCI 61A or Data Structures"
          className="rounded-[1.4rem] border border-[rgba(33,51,79,0.15)] bg-[#f7f4ee] px-4 py-3 text-sm text-[#19212f] outline-none transition focus:border-[#8a3f20]"
        />
        <input
          list={datalistId}
          value={right}
          onChange={(event) => setRight(event.target.value)}
          placeholder="DATA C100 or Principles of Data Science"
          className="rounded-[1.4rem] border border-[rgba(33,51,79,0.15)] bg-[#f7f4ee] px-4 py-3 text-sm text-[#19212f] outline-none transition focus:border-[#8a3f20]"
        />
        <button className="rounded-[1.4rem] bg-[#19212f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#273247]">
          Compare
        </button>
        <datalist id={datalistId}>
          {options.map((option) => (
            <option key={option.id} value={option.code}>{option.title}</option>
          ))}
        </datalist>
      </form>

      <div className="mt-5 flex flex-wrap gap-3">
        {featuredPairs.map((pair) => (
          <button
            key={pair.label}
            type="button"
            onClick={() => {
              setLeft(pair.left);
              setRight(pair.right);
              router.push(`/compare?left=${encodeURIComponent(pair.left)}&right=${encodeURIComponent(pair.right)}`);
            }}
            className="rounded-full border border-[rgba(138,63,32,0.18)] bg-[#fffaf0] px-4 py-2 text-sm font-medium text-[#71311a] transition hover:border-[#8a3f20] hover:bg-[#fff3df]"
          >
            {pair.label}
          </button>
        ))}
      </div>
    </div>
  );
}
