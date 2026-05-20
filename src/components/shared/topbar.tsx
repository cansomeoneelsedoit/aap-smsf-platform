"use client";

import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import type { SmsfRole } from "@/auth.config";

export function Topbar({ name, email, role }: { name: string; email: string; role: SmsfRole }) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-muted-foreground">{email}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{role}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/signin" })}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
