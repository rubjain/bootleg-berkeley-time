type ProgressMeterProps = {
  label: string;
  value: number;
  subtitle?: string;
};

export function ProgressMeter({ label, value, subtitle }: ProgressMeterProps) {
  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[#19212f]">{label}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[#6a7383]">{subtitle}</p> : null}
        </div>
        <p className="text-lg font-semibold text-[#2f6f6a]">{value}%</p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-[rgba(36,48,71,0.08)]">
        <div
          className="h-full rounded-full bg-[#2f6f6a]"
          style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
        />
      </div>
    </div>
  );
}
