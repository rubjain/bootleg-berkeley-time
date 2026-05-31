import Link from "next/link";
import { Badge } from "@/components/badge";
import { RecommendationResult } from "@/lib/types";

export function RecommendationList({ items }: { items: RecommendationResult[] }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div
          key={item.courseCode}
          className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#19212f]">{item.courseCode}</h3>
              <p className="text-sm text-[#6a7383]">{item.title}</p>
            </div>
            <Badge tone="official">Score {item.score}</Badge>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {item.reasons.map((reason) => (
              <p key={reason} className="text-sm text-[#4b5668]">
                {reason}
              </p>
            ))}
            {item.socialSignal ? <p className="text-sm text-[#2f6f6a]">{item.socialSignal}</p> : null}
            {item.warnings.map((warning) => (
              <p key={warning} className="text-sm text-[#8b3d32]">
                {warning}
              </p>
            ))}
          </div>
          {item.courseSlug ? (
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Link
                href={`/courses/${item.courseSlug}`}
                className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline"
              >
                Open course
              </Link>
              {item.compareWithSlug ? (
                <Link
                  href={`/compare?left=${item.courseSlug}&right=${item.compareWithSlug}`}
                  className="font-medium text-[#1d6b6d] underline-offset-2 hover:underline"
                >
                  Compare with {item.compareWithCode ?? "related course"}
                </Link>
              ) : null}
              <Link
                href={`/planner`}
                className="font-medium text-[#6a7383] underline-offset-2 hover:text-[#19212f] hover:underline"
              >
                Add in planner
              </Link>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
