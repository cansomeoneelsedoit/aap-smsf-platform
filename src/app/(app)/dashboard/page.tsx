import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MatterStage } from "@prisma/client";

const STAGE_ORDER: MatterStage[] = [
  MatterStage.START,
  MatterStage.PREPARE,
  MatterStage.CHECK,
  MatterStage.LODGE,
  MatterStage.ACTIVE,
];

const STAGE_LABEL: Record<MatterStage, string> = {
  START: "Start",
  PREPARE: "Prepare",
  CHECK: "Check",
  LODGE: "Lodge",
  ACTIVE: "Active",
};

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user.role ?? "STAFF";

  // Master Owner / Superuser sees everything. Other staff see matters where
  // they're the current stage owner. Clients see only their own matters.
  // (Simplified scoping for v1 — proper RBAC arrives with the role pages.)
  const matters = await prisma.matter.findMany({
    include: {
      companyGroup: true,
      primaryContact: true,
      stageAssignments: {
        include: { staff: { include: { user: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts: Record<MatterStage, number> = {
    START: 0,
    PREPARE: 0,
    CHECK: 0,
    LODGE: 0,
    ACTIVE: 0,
  };
  for (const m of matters) counts[m.stage]++;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{session?.user.email}</span> ({role})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {STAGE_ORDER.map((stage) => (
          <Card key={stage}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                {STAGE_LABEL[stage]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{counts[stage]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter</TableHead>
                <TableHead>Fund</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Company group</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No matters yet. Run <code>npm run db:seed</code> to populate demo data.
                  </TableCell>
                </TableRow>
              ) : (
                matters.map((m) => {
                  const owner = m.stageAssignments.find((a) => a.stage === m.stage)?.staff;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.matterRef}</TableCell>
                      <TableCell className="font-medium">{m.fundName}</TableCell>
                      <TableCell>
                        <Badge variant="accent">{STAGE_LABEL[m.stage]}</Badge>
                      </TableCell>
                      <TableCell>{m.companyGroup?.name ?? "—"}</TableCell>
                      <TableCell>{owner?.user.name ?? "Unassigned"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
