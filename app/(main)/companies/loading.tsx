import { Skeleton } from "@/components/ui/skeleton";

function CompanyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-brand border border-brand-border bg-white p-5">
      <div className="mb-3.5 flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-brand-sm" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-7 w-10" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-7 w-10" />
        </div>
      </div>
      <Skeleton className="mt-3 h-3 w-3/5" />
    </div>
  );
}

export default function CompaniesLoading() {
  return (
    <>
      <div className="mb-3.5 flex justify-end">
        <Skeleton className="h-9 w-40 rounded-brand-sm" />
      </div>
      <div className="grid gap-3.5 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CompanyCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
