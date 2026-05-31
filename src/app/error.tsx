"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#f7f0e6] px-4">
        <div className="max-w-lg rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.92)] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[#19212f]">Something went wrong</h1>
          <p className="mt-3 text-sm text-[#6a7383]">
            {error.message || "CourseMap hit an unexpected error while loading this page."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-[#243047] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link href="/" className="rounded-full border border-[rgba(39,50,71,0.12)] px-5 py-2.5 text-sm font-semibold text-[#314056]">
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
