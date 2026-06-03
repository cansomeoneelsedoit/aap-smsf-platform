import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tag,
  tagVariant = "orange",
  className,
  valueClassName,
}: {
  label: string;
  value: string | number;
  tag?: string;
  tagVariant?: "orange" | "green" | "amber" | "red" | "purple";
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-brand border border-brand-border bg-white p-4",
        className
      )}
    >
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-text-3">
        {label}
      </div>
      <div
        className={cn(
          "text-[28px] font-extrabold tracking-tight text-brand-dark",
          valueClassName
        )}
      >
        {value}
      </div>
      {tag && (
        <Badge variant={tagVariant} className="mt-1.5">
          {tag}
        </Badge>
      )}
    </div>
  );
}
