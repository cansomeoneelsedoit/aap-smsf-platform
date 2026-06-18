import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogLoading() {
  return (
    <div className="rounded-brand border border-brand-border bg-white">
      <div className="flex items-center justify-between border-b border-brand-border px-4 py-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="grid grid-cols-[160px_160px_1fr_120px] gap-2 border-b border-brand-border bg-brand-surface px-4 py-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[160px_160px_1fr_120px] gap-2 border-b border-brand-surface-2 px-4 py-2.5 last:border-0"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
