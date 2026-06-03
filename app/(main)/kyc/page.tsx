"use client";

import { StatCard } from "@/components/brand/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatterActions } from "@/hooks/use-mock-store";

export default function KycPage() {
  const { approveKyc, requestKycInfo } = useMatterActions();

  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Active verifications" value="8" />
        <StatCard label="Passed this month" value="14" />
        <StatCard label="Needs review" value="2" valueClassName="text-brand-red" />
      </div>
      <Card className="mb-3.5">
        <CardHeader>
          <CardTitle>Provider registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 border-b border-brand-surface-2 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-sm">🔐</div>
            <div className="flex-1">
              <div className="font-semibold">AAP Native KYC</div>
              <div className="text-[11px] text-brand-text-3">Built-in · identity + liveness + adverse media</div>
            </div>
            <Badge variant="green">Active</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent verifications</CardTitle></CardHeader>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-brand-surface text-left text-[10px] font-bold uppercase text-brand-text-3">
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Matter</th>
              <th className="px-4 py-2">Result</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-t border-brand-surface-2 px-4 py-2">John Smith</td>
              <td className="border-t border-brand-surface-2 px-4 py-2">M001</td>
              <td className="border-t border-brand-surface-2 px-4 py-2"><Badge variant="green">Pass</Badge></td>
              <td className="border-t border-brand-surface-2 px-4 py-2"><Button variant="outline" size="xs">View</Button></td>
            </tr>
            <tr>
              <td className="border-t border-brand-surface-2 px-4 py-2">Mary Smith</td>
              <td className="border-t border-brand-surface-2 px-4 py-2">M001</td>
              <td className="border-t border-brand-surface-2 px-4 py-2"><Badge variant="amber">In progress</Badge></td>
              <td className="border-t border-brand-surface-2 px-4 py-2">
                <Button variant="outline" size="xs" onClick={() => approveKyc("M001")}>Approve</Button>
              </td>
            </tr>
            <tr>
              <td className="border-t border-brand-surface-2 px-4 py-2">Mark Davis</td>
              <td className="border-t border-brand-surface-2 px-4 py-2">M006</td>
              <td className="border-t border-brand-surface-2 px-4 py-2"><Badge variant="red">Review</Badge></td>
              <td className="border-t border-brand-surface-2 px-4 py-2">
                <Button variant="outline" size="xs" onClick={requestKycInfo}>Review</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </>
  );
}
