type GradeDistributionProps = {
  data?: Record<string, number>;
};

export function GradeDistribution({ data }: GradeDistributionProps) {
  if (!data) {
    return <p className="text-sm text-[#6a7383]">No grade distribution loaded for this course yet.</p>;
  }

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([grade, value]) => (
        <div key={grade} className="grid grid-cols-[48px_1fr_48px] items-center gap-3">
          <span className="text-sm font-medium text-[#4b5668]">{grade}</span>
          <div className="h-3 overflow-hidden rounded-full bg-[rgba(36,48,71,0.08)]">
            <div className="h-full rounded-full bg-[#2f6f6a]" style={{ width: `${value}%` }} />
          </div>
          <span className="text-right text-sm text-[#6a7383]">{value}%</span>
        </div>
      ))}
    </div>
  );
}
