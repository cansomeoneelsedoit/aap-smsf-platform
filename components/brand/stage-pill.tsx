import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/types";

const variants: Record<string, string> = {
  "pill-start": "bg-[#eff6ff] text-[#1d4ed8]",
  "pill-prepare": "bg-[#fdf4ff] text-[#7e22ce]",
  "pill-check": "bg-[#fff7ed] text-[#c2410c]",
  "pill-lodge": "bg-[#fefce8] text-[#854d0e]",
  "pill-active": "bg-[#f0fdf4] text-brand-green",
};

export function StagePill({
  stage,
  pillClass,
  className,
}: {
  stage: Stage | string;
  pillClass?: string;
  className?: string;
}) {
  const key = pillClass ?? `pill-${String(stage).toLowerCase()}`;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        variants[key] ?? variants["pill-start"],
        className
      )}
    >
      {stage}
    </span>
  );
}
