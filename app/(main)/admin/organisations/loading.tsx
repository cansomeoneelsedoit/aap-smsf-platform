import { Skeleton } from "@/components/ui/skeleton";

export default function OrganisationsLoading() {
  return (
    <>
      <div className="mb-3.5 flex justify-end">
        <Skeleton className="h-9 w-36 rounded-brand-sm" />
      </div>
      <div className="grid gap-3.5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-brand" />
        ))}
      </div>
    </>
  );
}
