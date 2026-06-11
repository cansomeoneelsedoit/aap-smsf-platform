import { Skeleton } from "@/components/ui/skeleton";

export default function PreparationLoading() {
  return (
    <>
      <Skeleton className="mb-3.5 h-4 w-72" />
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-brand border border-brand-border bg-white p-4"
          >
            <Skeleton className="min-h-11 w-1 shrink-0 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-9 w-16 rounded-brand-sm" />
          </div>
        ))}
      </div>
    </>
  );
}
