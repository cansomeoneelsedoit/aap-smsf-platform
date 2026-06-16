"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMatterActions } from "@/hooks/use-mock-store";
import { saveStageAssignmentAction } from "@/lib/actions/matter-actions";
import { mapStaffRoleToLabel, STAFF_COLOR_CLASSES } from "@/lib/mappers";
import { STAGES } from "@/lib/mock-data";
import type { Stage } from "@/generated/prisma/client";

type StaffProfile = {
  userId: string;
  role: string;
  initials: string;
  color: string;
  hobbies: string | null;
  user: { name: string; email: string };
};

export function UsersPageClient({
  staff,
  assignments,
}: {
  staff: StaffProfile[];
  assignments: { stage: string; staffId: string }[];
}) {
  const router = useRouter();
  const { inviteUser, saveDefaultAssignments } = useMatterActions();
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(assignments.map((a) => [a.stage, a.staffId]))
  );

  const handleSaveDefaults = async () => {
    for (const stage of STAGES) {
      const staffId = selected[stage];
      if (staffId) {
        await saveStageAssignmentAction(stage as Stage, staffId);
      }
    }
    saveDefaultAssignments();
    router.refresh();
  };

  return (
    <>
      <div className="mb-3.5 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            const email = prompt("Enter email address to invite as staff:");
            if (email) inviteUser(email);
          }}
        >
          + Invite staff
        </Button>
      </div>
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        {staff.map((s) => (
          <Card key={s.userId} className="cursor-pointer p-6 text-center">
            <div
              className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${STAFF_COLOR_CLASSES[s.role] ?? "bg-brand-orange-light text-brand-orange"}`}
            >
              {s.initials}
            </div>
            <div className="text-lg font-extrabold">{s.user.name}</div>
            <div className="text-[13px] font-semibold text-brand-orange">
              {mapStaffRoleToLabel(s.role)}
            </div>
            <div className="mt-3 rounded-brand-sm bg-brand-surface p-3 text-left text-xs text-brand-text-2">
              {s.hobbies && <div>{s.hobbies}</div>}
              <div>{s.user.email}</div>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full justify-center">
              Edit profile
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-7">
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold">Default stage assignments</h2>
            <p className="text-xs text-brand-text-2">
              Applied to every new matter. Override per-matter from Reassign.
            </p>
          </div>
          <Button size="sm" onClick={handleSaveDefaults}>
            Save defaults
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {STAGES.map((stage) => (
            <div key={stage} className="rounded-brand border-[1.5px] border-brand-border p-3.5 text-center">
              <div className="mb-2 text-xs font-bold">{stage}</div>
              <select
                className="w-full rounded-brand-sm border border-brand-border-2 px-2 py-1.5 text-xs"
                value={selected[stage] ?? ""}
                onChange={(e) =>
                  setSelected((prev) => ({ ...prev, [stage]: e.target.value }))
                }
              >
                <option value="">Assigned on creation</option>
                {staff.map((s) => (
                  <option key={s.userId} value={s.userId}>
                    {s.user.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
