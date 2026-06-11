"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addAuditEntryAction } from "@/lib/actions/matter-actions";
import { buildCallUrl } from "@/lib/threecx";

export function CallButton({
  name,
  phone,
  auditMatterId,
  auditEntity,
}: {
  name: string;
  phone: string | null;
  auditMatterId?: string | null;
  auditEntity?: string;
}) {
  const callUrl = phone ? buildCallUrl(phone) : null;

  const handleCall = () => {
    if (!callUrl) return;
    window.open(callUrl, "_blank", "noopener,noreferrer");
    toast.success(`Dialling ${name} via 3CX…`);
    if (auditMatterId !== undefined || auditEntity) {
      void addAuditEntryAction(
        auditMatterId ?? null,
        "CALL_INITIATED",
        `3CX outbound · ${name} · ${phone}`,
        auditEntity
      );
    }
  };

  return (
    <Button
      variant="outline"
      size="xs"
      className={
        callUrl ? "border-brand-green bg-brand-green-light text-brand-green" : undefined
      }
      onClick={handleCall}
      disabled={!callUrl}
    >
      📞 Call
    </Button>
  );
}
