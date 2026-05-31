import Link from "next/link";

type CoursePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  searchParams: Record<string, string | undefined>;
};

function buildHref(page: number, searchParams: CoursePaginationProps["searchParams"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}

function visiblePages(current: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const page = current + offset;
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  return [...pages].sort((left, right) => left - right);
}

export function CoursePagination({ page, totalPages, total, searchParams }: CoursePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(page, totalPages);

  return (
    <nav className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Course list pagination">
      <p className="text-sm text-[#6a7383]">
        Page {page} of {totalPages} · {total.toLocaleString()} course{total === 1 ? "" : "s"} total
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref(Math.max(1, page - 1), searchParams)}
          aria-disabled={page <= 1}
          className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[rgba(39,50,71,0.12)] ${
            page <= 1
              ? "pointer-events-none bg-[rgba(36,48,71,0.04)] text-[#9aa3b2]"
              : "bg-[rgba(255,252,246,0.9)] text-[#314056] hover:text-[#19212f]"
          }`}
        >
          Previous
        </Link>
        {pages.map((pageNumber, index) => {
          const prev = pages[index - 1];
          const showEllipsis = prev !== undefined && pageNumber - prev > 1;
          return (
            <span key={pageNumber} className="flex items-center gap-2">
              {showEllipsis ? <span className="px-1 text-sm text-[#9aa3b2]">…</span> : null}
              <Link
                href={buildHref(pageNumber, searchParams)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  pageNumber === page
                    ? "bg-[#243047] text-white"
                    : "bg-[rgba(255,252,246,0.9)] text-[#5a6273] ring-1 ring-[rgba(39,50,71,0.12)] hover:text-[#19212f]"
                }`}
              >
                {pageNumber}
              </Link>
            </span>
          );
        })}
        <Link
          href={buildHref(Math.min(totalPages, page + 1), searchParams)}
          aria-disabled={page >= totalPages}
          className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-[rgba(39,50,71,0.12)] ${
            page >= totalPages
              ? "pointer-events-none bg-[rgba(36,48,71,0.04)] text-[#9aa3b2]"
              : "bg-[rgba(255,252,246,0.9)] text-[#314056] hover:text-[#19212f]"
          }`}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
