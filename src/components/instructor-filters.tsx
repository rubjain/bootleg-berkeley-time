"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const SEARCH_DEBOUNCE_MS = 350;

type InstructorFiltersProps = {
  departments: string[];
};

export function InstructorFilters({ departments }: InstructorFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const department = searchParams.get("department") ?? "";
  const [draftQuery, setDraftQuery] = useState<string | null>(null);
  const searchInput = draftQuery ?? q;

  function pushWithParams(params: URLSearchParams) {
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/instructors?${query}` : "/instructors");
    });
  }

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    pushWithParams(params);
  }

  useEffect(() => {
    const trimmedInput = searchInput.trim();
    const trimmedParam = q.trim();
    if (trimmedInput === trimmedParam) return;

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmedInput) params.set("q", trimmedInput);
      else params.delete("q");
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
        if (nextQ) params.set("q", nextQ);
        if (nextDepartment) params.set("department", nextDepartment);
        setDraftQuery(nextQ);
        pushWithParams(params);
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          name="q"
          value={searchInput}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Search instructor name, department, or course..."
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
      {pending ? <p className="text-xs text-[#6a7383]">Updating instructor results…</p> : null}

      <select
        name="department"
        defaultValue={department}
        onChange={(event) => updateParam("department", event.target.value)}
        className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[#19212f] md:max-w-xs"
      >
        <option value="">All departments</option>
        {departments.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </form>
  );
}
