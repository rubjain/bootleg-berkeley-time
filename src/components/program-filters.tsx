"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function ProgramFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/programs?${params.toString()}`));
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        const nextQ = String(formData.get("q") ?? "").trim();
        const nextType = String(formData.get("type") ?? "");
        if (nextQ) params.set("q", nextQ);
        if (nextType) params.set("type", nextType);
        startTransition(() => router.push(`/programs?${params.toString()}`));
      }}
    >
      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search program name or code..."
          className="w-full rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[#19212f] outline-none transition focus:border-[#1d6b6d]"
        />
        <select
          name="type"
          defaultValue={type}
          onChange={(event) => updateParam("type", event.target.value)}
          className="rounded-2xl border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[#19212f] lg:max-w-[220px]"
        >
          <option value="">All program types</option>
          <option value="MAJOR">Majors only</option>
          <option value="MINOR">Minors only</option>
          <option value="CERTIFICATE">Certificates</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-[#243047] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19212f] disabled:opacity-60"
        >
          {pending ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
}
