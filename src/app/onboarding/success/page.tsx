import Link from "next/link";

import { AapLogo } from "@/components/shared/aap-logo";

export default async function OnboardingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ matter?: string }>;
}) {
  const { matter } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b px-10 py-4">
        <div className="flex items-center gap-2.5">
          <AapLogo size={36} />
          <span className="text-[18px] font-bold tracking-tight">Admin Autopilot</span>
        </div>
      </header>
      <main className="mx-auto max-w-md flex-1 px-5 py-20 text-center">
        <div className="text-[56px]">🎉</div>
        <h1 className="mt-4 text-[22px] font-extrabold">Your SMSF matter is live!</h1>
        <p className="mt-3 text-[14px] leading-6 text-[color:var(--color-aap-text2)]">
          Matter ID:{" "}
          <strong className="text-[color:var(--color-aap-dark)]">{matter ?? "—"}</strong>
          <br />
          Emma Wilson has been notified and will accept your file shortly. You&apos;ll receive an email with your KYC verification link.
        </p>
        <div className="mt-7 flex justify-center gap-2">
          <Link
            href="/signin"
            className="rounded-lg bg-[color:var(--color-aap-orange)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)]"
          >
            Staff login →
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3.5 py-2 text-[13px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
          >
            New onboarding
          </Link>
        </div>
      </main>
    </div>
  );
}
