import { isDemoMode } from "@/lib/env";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="sticky top-0 z-50 bg-brand-orange px-4 py-2 text-center text-sm font-semibold text-white">
      You&apos;re in demo mode
    </div>
  );
}
