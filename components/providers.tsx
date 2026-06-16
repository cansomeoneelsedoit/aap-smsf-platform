"use client";

import { Toaster } from "sonner";
import { Modals } from "@/app/(main)/components/modals";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Modals />
      <Toaster position="bottom-center" richColors />
    </>
  );
}
