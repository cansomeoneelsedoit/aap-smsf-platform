"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function PortalMessagesPage() {
  return (
    <>
      <h2 className="mb-4 text-[15px] font-bold">Messages</h2>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="rounded-brand-sm bg-brand-surface p-3">
            <div className="text-[11px] text-brand-text-3">Michael Torres · Yesterday</div>
            <p className="text-[13px]">Hi John, we&apos;re reviewing your file and will need Mary&apos;s KYC completed before lodgement.</p>
          </div>
          <div className="flex justify-end gap-2">
            <div className="max-w-[70%] rounded-brand-sm bg-brand-orange p-3 text-white">
              <div className="text-[11px] opacity-75">You · Just now</div>
              <p className="text-[13px]">Thanks Michael — Mary will complete KYC when she returns.</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Input placeholder="Reply to your team…" className="flex-1" />
            <Button size="sm">Send</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
