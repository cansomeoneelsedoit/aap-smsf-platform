"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PACKAGES = [
  { id: "default", label: "Default + Accounting", price: "$999", features: ["ASIC & ATO compliance", "Annual audit coordination", "Tax return preparation", "Bookkeeping & accounting"] },
  { id: "unlisted", label: "Default + Accounting + Unlisted", price: "$1,149", features: ["Everything in Default", "Unlisted asset valuations", "Specialist reporting"] },
  { id: "byoa", label: "BYOA Package", price: "$1,399", features: ["ASIC & ATO compliance", "Annual audit coordination", "You supply your own accountant"] },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPkg, setSelectedPkg] = useState("default");
  const [trustee, setTrustee] = useState<"individual" | "corporate">("individual");
  const [fundName, setFundName] = useState("Smith Family Superannuation Fund");
  const [fundCompany, setFundCompany] = useState("");
  const totalSteps = 5;

  const pkg = PACKAGES.find((p) => p.id === selectedPkg) ?? PACKAGES[0];

  const submit = () => setStep(6);
  const next = () => (step < totalSteps ? setStep(step + 1) : submit());
  const prev = () => step > 1 && setStep(step - 1);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex shrink-0 items-center justify-between border-b border-brand-border px-10 py-4">
        <Logo />
        <div className="hidden items-center gap-2 md:flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-1.5 text-[13px]">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                  n < step && "border-brand-orange bg-brand-orange text-white",
                  n === step && "border-brand-dark text-brand-dark",
                  n > step && "border-brand-border-2 text-brand-text-3"
                )}
              >
                {n < step ? "✓" : n}
              </div>
              <span className={cn(n === step ? "font-semibold text-brand-dark" : "text-brand-text-3")}>
                {["Service", "Package", "Fund", "Members", "Review"][n - 1]}
              </span>
              {n < 5 && <div className={cn("h-px w-8", n < step ? "bg-brand-orange" : "bg-brand-border-2")} />}
            </div>
          ))}
        </div>
      </header>

      <div className="mx-auto w-full max-w-[900px] flex-1 px-5 py-10">
        {step === 1 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-orange">Step 1 of 5</p>
            <h2 className="mb-1.5 text-[26px] font-bold tracking-tight">Choose your administrator</h2>
            <p className="mb-8 text-[15px] text-brand-text-2">Who will administer your SMSF?</p>
            <div
              className="max-w-[620px] cursor-pointer rounded-brand border-2 border-brand-orange bg-brand-orange-light p-5"
              onClick={() => {}}
            >
              <div className="text-[17px] font-bold">Admin Autopilot</div>
              <p className="mt-1.5 text-[13px] text-brand-text-2 leading-relaxed">
                Full-service SMSF administration — ASIC, ATO, audit coordination, and compliance monitoring.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-orange">Step 2 of 5</p>
            <h2 className="mb-8 text-[26px] font-bold tracking-tight">Select your package</h2>
            <div className="grid max-w-[900px] grid-cols-1 gap-3.5 md:grid-cols-3">
              {PACKAGES.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPkg(p.id)}
                  className={cn(
                    "relative cursor-pointer rounded-brand border-2 p-6 transition-all",
                    selectedPkg === p.id ? "border-brand-orange bg-brand-orange-light" : "border-brand-border hover:border-brand-orange-border"
                  )}
                >
                  <div className="text-[17px] font-bold">{p.label}</div>
                  <div className="text-[30px] font-extrabold tracking-tight text-brand-orange">{p.price}</div>
                  <div className="text-xs text-brand-text-3">AUD/year</div>
                  <ul className="mt-3.5 space-y-1 text-[13px] text-brand-text-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-1.5"><span className="text-brand-green font-bold">✓</span>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-orange">Step 3 of 5</p>
            <h2 className="mb-8 text-[26px] font-bold tracking-tight">Fund details</h2>
            <div className="grid max-w-[600px] grid-cols-2 gap-3">
              <div className="col-span-2"><Label>SMSF name</Label><Input value={fundName} onChange={(e) => setFundName(e.target.value)} /></div>
              <div><Label>ABN (if registered)</Label><Input placeholder="12 345 678 901" /></div>
              <div><Label>TFN (if known)</Label><Input placeholder="Tax file number" /></div>
              <div><Label>Establishment date</Label><Input type="date" defaultValue="2026-01-15" /></div>
              <div><Label>Fund type</Label><Input defaultValue="New SMSF Setup" /></div>
              <div><Label>Company group / referrer</Label>
                <select className="h-10 w-full rounded-brand-sm border-[1.5px] border-brand-border-2 px-3 text-sm" value={fundCompany} onChange={(e) => setFundCompany(e.target.value)}>
                  <option value="">— Select firm —</option>
                  <option>Clime ASX</option><option>Liberty</option><option>RiverX</option><option>AAP (direct)</option>
                </select>
              </div>
            </div>
            <div className="mt-4 rounded-brand border-[1.5px] border-brand-border p-5">
              <div className="mb-3.5 text-[13px] font-semibold">Trustee structure</div>
              <div className="flex gap-3">
                {(["individual", "corporate"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrustee(t)}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center gap-2 rounded-brand-sm border-[1.5px] p-3 text-[13px] font-medium capitalize",
                      trustee === t ? "border-brand-orange bg-brand-orange-light text-brand-orange" : "border-brand-border-2 text-brand-text-2"
                    )}
                  >
                    {t === "individual" ? "Individual trustees" : "Corporate trustee"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-orange">Step 4 of 5</p>
            <h2 className="mb-8 text-[26px] font-bold tracking-tight">Fund members & trustees</h2>
            <div className="max-w-[600px] rounded-brand border-[1.5px] border-brand-border p-4">
              <div className="mb-3 text-[13px] font-semibold">Member 1 (primary contact)</div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First name</Label><Input defaultValue="John" /></div>
                <div><Label>Last name</Label><Input defaultValue="Smith" /></div>
                <div className="col-span-2"><Label>Email</Label><Input type="email" defaultValue="john@smithfamily.com.au" /></div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-2">+ Add member</Button>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-orange">Step 5 of 5</p>
            <h2 className="mb-8 text-[26px] font-bold tracking-tight">Review your setup</h2>
            <div className="max-w-[620px] space-y-4 rounded-brand border-[1.5px] border-brand-border p-5">
              <div className="flex justify-between text-[13px]"><span className="text-brand-text-2">Package</span><span className="font-medium">{pkg.label} ({pkg.price}/yr)</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-brand-text-2">Fund name</span><span className="font-medium">{fundName}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-brand-text-2">Company group</span><span className="font-medium">{fundCompany || "—"}</span></div>
            </div>
            <div className="mt-3 flex max-w-[620px] items-center justify-between rounded-brand border-[1.5px] border-brand-orange-border bg-brand-orange-light px-5 py-4">
              <span className="text-sm font-semibold">Annual administration fee</span>
              <span className="text-[22px] font-extrabold text-brand-orange">{pkg.price} AUD/year</span>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="mx-auto max-w-[480px] py-10 text-center">
            <div className="mb-4 text-5xl">🎉</div>
            <h2 className="mb-2 text-[22px] font-extrabold">Your SMSF matter is live!</h2>
            <p className="mb-7 text-sm text-brand-text-2 leading-relaxed">
              Matter ID: <strong>AAP-2026-0847</strong>
              <br />
              Emma Wilson has been notified and will accept your file shortly.
            </p>
            <Button onClick={() => router.push("/portal")}>
              Go to my portal →
            </Button>
          </div>
        )}
      </div>

      {step <= totalSteps && (
        <footer className="flex shrink-0 items-center justify-between border-t border-brand-border bg-white px-10 py-4">
          <Button variant="back" onClick={prev} disabled={step <= 1}>
            ← Back
          </Button>
          <span className="text-xs text-brand-text-3">Takes about 5 minutes</span>
          <Button onClick={next}>{step === totalSteps ? "Submit →" : "Continue →"}</Button>
        </footer>
      )}
    </div>
  );
}
