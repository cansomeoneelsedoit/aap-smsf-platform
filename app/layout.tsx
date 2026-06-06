import type { Metadata } from "next";
import { Instrument_Sans, Dancing_Script } from "next/font/google";
import { Providers } from "@/components/providers";
import { DemoBanner } from "@/components/layout/demo-banner";
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
