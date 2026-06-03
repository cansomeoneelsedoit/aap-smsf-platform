import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import { Providers } from "@/components/providers";
import { DemoBanner } from "@/components/layout/demo-banner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} ${dancingScript.variable} antialiased`}>
        <DemoBanner />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
