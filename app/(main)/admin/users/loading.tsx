import { Skeleton } from "@/components/ui/skeleton";

export default function UsersLoading() {
  return (
    <>
      <div className="mb-3.5 flex justify-end">
        <Skeleton className="h-9 w-28 rounded-brand-sm" />
      </div>
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-brand" />
        ))}
      </div>
      <div className="mt-7">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-9 w-28 rounded-brand-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-brand" />
          ))}
        </div>
      </div>
    </>
  );
}
