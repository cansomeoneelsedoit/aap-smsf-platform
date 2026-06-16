import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
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

  return (
    <StaffShell session={session}>
      {children}
      {modal}
    </StaffShell>
  );
}
