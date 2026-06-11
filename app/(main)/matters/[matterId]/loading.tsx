import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ContactRowSkeleton({ nested }: { nested?: boolean }) {
  return (
    <div
      className={
        nested
          ? "flex items-center gap-2.5 border-b border-brand-surface-2 py-2 pl-6 last:border-0"
          : "flex items-center gap-2.5 border-b border-brand-surface-2 py-2 last:border-0"
      }
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-6 w-14 rounded-full" />
      <Skeleton className="h-7 w-16 rounded-brand-sm" />
    </div>
  );
}

function StageChipSkeleton() {
  return (
    <div className="flex min-w-[140px] flex-1 items-center gap-2.5 rounded-brand-sm border-[1.5px] border-brand-border bg-white p-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

export default function MatterDetailLoading() {
  return (
    <>
      <Skeleton className="mb-3.5 h-8 w-36 rounded-brand-sm" />

      <Card className="mb-4 p-5">
        <div className="mb-3.5 flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="ml-auto h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-7 w-2/5" />
        <Skeleton className="mt-2 h-4 w-3/5" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex max-w-[480px] flex-1 items-center justify-between px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-brand-sm" />
            <Skeleton className="h-9 w-24 rounded-brand-sm" />
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="pt-1">
          <div className="border-b border-brand-surface-2 py-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="mt-1.5 h-3 w-1/3" />
          </div>
          <ContactRowSkeleton />
          <ContactRowSkeleton />
          <ContactRowSkeleton nested />
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <StageChipSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="mb-4 flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-brand-sm" />
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-brand-surface-2 px-[18px] py-2 last:border-0"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-brand-sm" />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
