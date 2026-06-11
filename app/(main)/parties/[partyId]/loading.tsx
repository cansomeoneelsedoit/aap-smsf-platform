import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PartyDetailLoading() {
  return (
    <>
      <Skeleton className="mb-3.5 h-8 w-36 rounded-brand-sm" />
      <Card className="mb-4 p-5">
        <Skeleton className="mb-2 h-6 w-24 rounded-full" />
        <Skeleton className="h-7 w-2/5" />
        <Skeleton className="mt-2 h-4 w-1/4" />
      </Card>
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-28" /></CardHeader>
            <CardContent className="space-y-3 pt-1">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="ml-auto h-9 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent className="space-y-2 pt-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
