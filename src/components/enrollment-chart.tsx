type EnrollmentChartProps = {
  data: Array<{
    termName: string;
    enrolled: number;
    capacity: number;
    fillRateBucket?: string | null;
  }>;
};

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  if (!data.length) {
    return <p className="text-sm text-[#6a7383]">No enrollment history available yet.</p>;
  }

  const maxValue = Math.max(...data.map((point) => point.capacity || point.enrolled || 1), 1);

  return (
    <div className="space-y-4">
      {data.map((point) => {
        const fillPercent = Math.round(((point.enrolled || 0) / maxValue) * 100);
        const capacityPercent = Math.round(((point.capacity || point.enrolled || 0) / maxValue) * 100);

        return (
          <EnrollmentPoint
            key={point.termName}
            point={point}
            fillPercent={fillPercent}
            capacityPercent={capacityPercent}
          />
        );
      })}
    </div>
  );
}

function EnrollmentPoint({
  point,
  fillPercent,
  capacityPercent
}: {
  point: EnrollmentChartProps["data"][number];
  fillPercent: number;
  capacityPercent: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-[#19212f]">{point.termName}</span>
        <span className="text-[#6a7383]">
          {point.enrolled}/{point.capacity} enrolled
          {point.fillRateBucket ? ` · ${point.fillRateBucket}` : ""}
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-[rgba(36,48,71,0.08)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[rgba(29,107,109,0.18)]"
          style={{ width: `${capacityPercent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#c96f4a]"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}