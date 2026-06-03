"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QueueItemData {
  matterId?: string;
  priority: "high" | "med" | "low";
  title: string;
  sub: string;
  meta: string;
  action?: string;
  onAction?: () => void;
}

const priorityColors = {
  high: "bg-brand-red",
  med: "bg-brand-amber",
  low: "bg-brand-green",
};

export function QueueList({ items, intro }: { items: QueueItemData[]; intro?: string }) {
  return (
    <>
      {intro && <p className="mb-3.5 text-[13px] text-brand-text-2">{intro}</p>}
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex cursor-pointer items-center gap-3.5 rounded-brand border border-brand-border bg-white p-4 transition-all hover:border-brand-orange-border hover:shadow-[0_1px_3px_rgba(0,0,0,.08)]"
          >
            <div className={cn("min-h-11 w-1 shrink-0 rounded-sm", priorityColors[item.priority])} />
            <div className="flex-1">
              <div className="text-[13px] font-bold">{item.title}</div>
              <div className="text-xs text-brand-text-2">{item.sub}</div>
              <div className="mt-0.5 text-[11px] text-brand-text-3">{item.meta}</div>
            </div>
            {item.matterId ? (
              <Button size="sm" asChild onClick={(e) => e.stopPropagation()}>
                <Link href={`/clients/${item.matterId}`}>{item.action ?? "Open"}</Link>
              </Button>
            ) : (
              <Button size="sm" onClick={item.onAction}>
                {item.action ?? "Open"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
