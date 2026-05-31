"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const SEARCH_DEBOUNCE_MS = 350;

type CourseFiltersProps = {
  departments: string[];
  levels: string[];
};

export function CourseFilters({ departments, levels }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const department = searchParams.get("department") ?? "";
  const level = searchParams.get("level") ?? "";
  const tone = searchParams.get("tone") ?? "";
  const [draftQuery, setDraftQuery] = useState<string | null>(null);
  const searchInput = draftQuery ?? q;

  function pushWithParams(params: URLSearchParams) {
    params.delete("page");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/courses?${query}` : "/courses");
    });
  }

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    pushWithParams(params);
  }

  useEffect(() => {
    const trimmedInput = searchInput.trim();
    const trimmedParam = q.trim();
    if (trimmedInput === trimmedParam) return;

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmedInput) {
        params.set("q", trimmedInput);
      } else {
        params.delete("q");
      }
      pushWithParams(params);
      setDraftQuery(null);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, q, searchParams.toString()]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        const nextQ = String(formData.get("q") ?? "").trim();
        const nextDepartment = String(formData.get("department") ?? "");
        const nextLevel = String(formData.get("level") ?? "");
        const nextTone = String(formData.get("tone") ?? "");
        if (nextQ) params.set("q", nextQ);
        if (nextDepartment) params.set("department", nextDepartment);
        if (nextLevel) params.set("level", nextLevel);
        if (nextTone) params.set("tone", nextTone);
        setDraftQuery(nextQ);
        pushWithParams(params);
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          name="q"
          value={searchInput}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Search course number, title, department..."
          className="w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[#19212f] outline-none transition focus:border-[#1d6b6d]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f] disabled:opacity-60"
        >
          {pending ? "Updating..." : "Search"}
        </button>
      </div>
      {pending ? <p className="text-xs text-[#6a7383]">Updating course results…</p> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <select
          name="department"
          defaultValue={department}
          onChange={(event) => updateParam("department", event.target.value)}
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[#19212f]"
        >
          <option value="">All departments</option>
          {departments.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>

        <select
          name="level"
          defaultValue={level}
          onChange={(event) => updateParam("level", event.target.value)}
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[#19212f]"
        >
          <option value="">All levels</option>
          {levels.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          name="tone"
          defaultValue={tone}
          onChange={(event) => updateParam("tone", event.target.value)}
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[#19212f]"
        >
          <option value="">All data types</option>
          <option value="official">Official data</option>
          <option value="projected">Projected offerings</option>
          <option value="historical">Historical</option>
        </select>
      </div>
    </form>
  );
}
