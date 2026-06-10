import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  "cb-clime": "bg-brand-blue-light text-[#1d4ed8]",
  "cb-liberty": "bg-brand-green-light text-brand-green",
  "cb-riverx": "bg-[#fdf4ff] text-[#7e22ce]",
  "cb-aap": "bg-brand-orange-light text-brand-orange",
  "cb-other": "bg-brand-surface-2 text-[#374151]",
};

export function AdviserGroupBadge({
  name,
  className,
  cbClass,
}: {
  name: string;
  className?: string;
  cbClass?: string;
}) {
  const key = cbClass ?? "cb-other";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        variants[key] ?? variants["cb-other"],
        className
      )}
    >
      {name}
    </span>
  );
}
