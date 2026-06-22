import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { getStaffNavBadgeCounts } from "@/lib/queries/nav-badges";
import { StaffShell } from "./layout-shell";

export default async function MainLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await getAppSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.accountType !== "STAFF") {
    redirect("/portal");
  }

  const navBadges = await getStaffNavBadgeCounts(session.user.id);

  return (
    <StaffShell session={session} navBadges={navBadges}>
      {children}
      {modal}
    </StaffShell>
  );
}
