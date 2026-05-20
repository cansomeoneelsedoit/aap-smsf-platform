"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Plus, Search, User as UserIcon } from "lucide-react";

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

export function Topbar({
  title,
  name,
  email,
  role,
}: {
  title: string;
  name: string;
  email: string;
  role: SmsfRole;
}) {
  return (
    <header className="flex h-14 items-center gap-3 border-b bg-white px-6">
      <div className="text-[16px] font-bold tracking-tight text-[color:var(--color-aap-dark)]">
        {title}
      </div>
      <div className="flex max-w-[420px] flex-1 items-center gap-2 px-2">
        <div className="relative flex w-full items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-[color:var(--color-aap-text3)]" />
          <input
            placeholder="Search clients, ABN, fund name…"
            className="w-full rounded-full border border-[color:var(--color-aap-surface2)] bg-[color:var(--color-aap-surface)] py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[color:var(--color-aap-orange)] focus:bg-white"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/onboarding"
          className="hidden h-9 items-center gap-1.5 rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 text-[13px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)] sm:inline-flex"
        >
          <Plus className="h-3.5 w-3.5" /> New client
        </Link>
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
