"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMockStore } from "@/hooks/use-mock-store";

export default function PortalActionsPage() {
  const openModal = useMockStore((s) => s.openModal);

  return (
    <>
      <h2 className="mb-4 text-[15px] font-bold">Actions required</h2>
      <div className="space-y-3">
        <Card className="border-brand-amber">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="text-2xl">🪪</span>
            <div className="flex-1">
              <div className="font-semibold">Complete KYC — Mary Smith</div>
              <div className="text-xs text-brand-text-2">Identity verification required before lodgement</div>
            </div>
            <Button size="sm" onClick={() => openModal("client-kyc")}>
              Start →
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <div className="font-semibold">Upload rollover statement</div>
              <div className="text-xs text-brand-text-2">Requested by Emma Wilson · Due 28 Mar</div>
            </div>
            <Button variant="outline" size="sm">Upload</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
