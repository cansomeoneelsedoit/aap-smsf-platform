import Link from "next/link";

import { AapLogo } from "@/components/shared/aap-logo";
import { OnboardingWizard } from "./wizard";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b px-10 py-4">
        <Link href="/onboarding" className="flex items-center gap-2.5">
          <AapLogo size={36} />
          <span className="text-[18px] font-bold tracking-tight">Admin Autopilot</span>
        </Link>
        <Link
          href="/signin"
          className="rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-1.5 text-[13px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
        >
          Staff login →
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <OnboardingWizard />
      </main>
    </div>
  );
}
