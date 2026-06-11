import { Skeleton } from "@/components/ui/skeleton";

export default function PartiesLoading() {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 min-w-[200px] flex-1" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="rounded-brand border border-brand-border bg-white">
        <div className="grid grid-cols-2 gap-2 border-b border-brand-border bg-brand-surface px-4 py-2.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-2 gap-2 border-b border-brand-surface-2 px-4 py-3 last:border-0"
          >
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </>
  );
}
