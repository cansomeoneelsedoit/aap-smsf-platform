import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar role={session.user.role ?? "STAFF"} />
      <div className="flex flex-1 flex-col">
        <Topbar
          name={session.user.name ?? session.user.email ?? "User"}
          email={session.user.email ?? ""}
          role={session.user.role ?? "STAFF"}
        />
        <main className="flex-1 overflow-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  );
}
