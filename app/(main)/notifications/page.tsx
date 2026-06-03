"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockStore } from "@/hooks/use-mock-store";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  { unread: true, text: "Handoff pending — Williams Corp Trustee awaiting Rachel Park acceptance (Lodge)", time: "15 minutes ago" },
  { unread: true, text: "Call note draft ready — Johnson Retirement Fund · Echo Notes", time: "22 minutes ago" },
  { unread: true, text: "KYC passed — John Smith identity verified · Smith Family SMSF", time: "1 hour ago" },
  { unread: false, text: "Task overdue — Mary Smith KYC was due 22 March", time: "1 hour ago" },
  { unread: false, text: "Stage advanced — Williams Corp Trustee → Lodge", time: "2 days ago" },
];

export default function NotificationsPage() {
  const markAllRead = useMockStore((s) => s.markAllRead);
  const notificationsRead = useMockStore((s) => s.notificationsRead);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <Button variant="outline" size="xs" onClick={markAllRead}>
          Mark all read
        </Button>
      </CardHeader>
      <CardContent className="px-[18px]">
        {NOTIFICATIONS.map((n, i) => (
          <div key={i} className="flex gap-2.5 border-b border-brand-surface-2 py-3 last:border-0">
            <div
              className={cn(
                "mt-1 h-2 w-2 shrink-0 rounded-full",
                !notificationsRead && n.unread ? "bg-brand-orange" : "bg-brand-border-2"
              )}
            />
            <div>
              <div className="text-[13px]">{n.text}</div>
              <div className="text-[11px] text-brand-text-3">{n.time}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
