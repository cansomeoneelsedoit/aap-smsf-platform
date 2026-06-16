import type { Metadata } from "next";
import Link from "next/link";
import { Instrument_Sans, Dancing_Script } from "next/font/google";
import { Providers } from "@/components/providers";
import { isDemoMode } from "@/lib/env";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "Admin Autopilot — SMSF Platform",
  description: "Admin Autopilot SMSF Administration Platform",
};

function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 bg-brand-orange px-4 py-2 text-sm font-semibold text-white">
      <span>You&apos;re in demo mode</span>
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-brand-sm border border-white/80 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
        >
          Staff
        </Link>
        <Link
          href="/portal/login"
          className="rounded-brand-sm border border-white/80 px-2.5 py-0.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
        >
          Client
        </Link>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} ${dancingScript.variable} antialiased`}>
        <DemoBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
