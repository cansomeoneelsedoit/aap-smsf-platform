import { Skeleton } from "@/components/ui/skeleton";

export default function MatterDetailLoading() {
  return (
    <>
      <Skeleton className="mb-3.5 h-8 w-36 rounded-brand-sm" />
      <Skeleton className="mb-4 h-44 rounded-brand" />
      <Skeleton className="mb-4 h-40 rounded-brand" />
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 min-w-[140px] flex-1 rounded-brand-sm" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-brand-sm" />
            ))}
          </div>
          <Skeleton className="h-56 rounded-brand" />
        </div>
        <Skeleton className="h-64 rounded-brand" />
      </div>
    </>
  );
}
