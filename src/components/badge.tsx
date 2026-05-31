import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "official" | "projected" | "warning" | "success";
};

const toneClassNames: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border border-[rgba(39,50,71,0.12)] bg-[rgba(255,255,255,0.72)] text-[#314056]",
  official: "border border-emerald-200/80 bg-emerald-50 text-emerald-900",
  projected: "border border-amber-200/80 bg-amber-50 text-amber-950",
  warning: "border border-rose-200/80 bg-rose-50 text-rose-900",
  success: "border border-teal-200/80 bg-teal-50 text-teal-900"
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
        toneClassNames[tone]
      )}
    >
      {children}
    </span>
  );
}
