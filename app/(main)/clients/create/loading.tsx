import { Skeleton } from "@/components/ui/skeleton";

export default function ClientCreateLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 rounded-brand" />
      <Skeleton className="h-48 rounded-brand" />
      <Skeleton className="h-48 rounded-brand" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24 rounded-brand-sm" />
        <Skeleton className="h-10 w-32 rounded-brand-sm" />
      </div>
    </div>
  );
}
