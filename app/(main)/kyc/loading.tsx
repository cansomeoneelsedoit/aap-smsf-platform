import { Skeleton } from "@/components/ui/skeleton";

export default function KycLoading() {
  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-brand" />
        ))}
      </div>
      <Skeleton className="mb-3.5 h-36 rounded-brand" />
      <div className="rounded-brand border border-brand-border bg-white">
        <div className="border-b border-brand-border px-4 py-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-4 gap-2 border-b border-brand-border bg-brand-surface px-4 py-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 border-b border-brand-surface-2 px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-14 justify-self-end rounded-brand-sm" />
          </div>
        ))}
      </div>
    </>
  );
}
