"use client";

import { Toaster } from "sonner";
import { Modals } from "@/components/modals/modals";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Modals />
      <Toaster position="bottom-center" richColors />
    </>
  );
}
