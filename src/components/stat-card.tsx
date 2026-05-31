type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-[rgba(39,50,71,0.12)] bg-[rgba(255,252,246,0.78)] p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#6a7383]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#19212f]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#4b5668]">{detail}</p>
    </div>
  );
}
