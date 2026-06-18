import { getStaffProfiles, getStageAssignments } from "@/lib/queries/matters";
import { UsersPageClient } from "./components/users-page-client";

export default async function UsersPage() {
  const [staff, assignments] = await Promise.all([
    getStaffProfiles(),
    getStageAssignments(),
  ]);

  return (
    <UsersPageClient
      staff={staff}
      assignments={assignments.map((a) => ({
        stage: a.stage,
        staffId: a.staffId,
      }))}
    />
  );
}
