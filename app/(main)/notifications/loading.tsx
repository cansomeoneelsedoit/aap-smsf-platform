import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="rounded-brand border border-brand-border bg-white">
      <div className="flex items-center justify-between border-b border-brand-border px-[18px] py-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-brand-sm" />
      </div>
      <div className="px-[18px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2.5 border-b border-brand-surface-2 py-3 last:border-0">
            <Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
