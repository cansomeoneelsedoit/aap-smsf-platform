import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth";
import { PortalShell } from "@/components/layout/portal-shell";
import { getClientPortalMatter } from "@/lib/queries/matters";

export default async function ProtectedPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();

  if (!session?.user) {
    redirect("/portal/login");
  }

  if (session.user.accountType !== "CLIENT") {
    redirect("/dashboard");
  }

  const matter = await getClientPortalMatter(session.user.id);

  return (
    <PortalShell session={session} matter={matter}>
      {children}
    </PortalShell>
  );
}
