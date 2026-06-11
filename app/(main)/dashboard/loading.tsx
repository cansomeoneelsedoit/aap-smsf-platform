import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-brand" />
        ))}
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-brand" />
        ))}
      </div>

      <Skeleton className="mb-5 h-20 rounded-brand" />

      <div className="grid gap-3.5 lg:grid-cols-2">
        <div className="rounded-brand border border-brand-border bg-white">
          <div className="grid grid-cols-4 gap-2 border-b border-brand-border bg-brand-surface px-4 py-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-16" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="grid grid-cols-4 gap-2 border-b border-brand-surface-2 px-4 py-3 last:border-0"
            >
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="rounded-brand border border-brand-border bg-white p-4">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2.5 border-b border-brand-surface-2 pb-3 last:border-0">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
