"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import type { MatterStage } from "@prisma/client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { stageLabel, stagePillClass } from "@/lib/display";

export function PortalTopbar({ fundName, stage }: { fundName: string; stage: MatterStage }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b bg-white px-6">
      <div className="text-[16px] font-bold tracking-tight text-[color:var(--color-aap-dark)]">
        {fundName}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className={stagePillClass(stage)}>{stageLabel(stage)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md border px-2.5 py-1 text-[12px] font-semibold hover:bg-muted">
            Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/signin" })}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
