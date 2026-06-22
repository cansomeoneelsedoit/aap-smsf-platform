import type { NavBadgeCounts } from "@/lib/types";
import { getOwnedMatterCountsByStage } from "@/lib/queries/matters";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";

export async function getStaffNavBadgeCounts(userId: string): Promise<NavBadgeCounts> {
  const [notificationCount, stageCounts] = await Promise.all([
    getUnreadNotificationCount(userId),
    getOwnedMatterCountsByStage(userId),
  ]);

  return {
    notifications: notificationCount,
    preparation: stageCounts.Prepare ?? 0,
    compliance: stageCounts.Check ?? 0,
    lodgement: stageCounts.Lodge ?? 0,
  };
}
