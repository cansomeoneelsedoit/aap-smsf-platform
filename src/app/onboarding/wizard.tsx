"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { submitOnboarding } from "./actions";

type Service = "full-service" | "byoa";
type PackageTier = "DEFAULT_PLUS_ACCOUNTING" | "UNLISTED_ASSETS" | "BYOA";

type Member = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
};

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Package" },
  { id: 3, label: "Fund" },
  { id: 4, label: "Members" },
  { id: 5, label: "Review" },
] as const;

const PRICES: Record<PackageTier, { price: string; label: string }> = {
  DEFAULT_PLUS_ACCOUNTING: { price: "$999", label: "AUD/year" },
  UNLISTED_ASSETS: { price: "$1,149", label: "AUD/year · unlisted add-on" },
  BYOA: { price: "$1,399", label: "AUD/year" },
};

export function OnboardingWizard() {
  const [step, setStep] = useState<number>(1);
  const [service, setService] = useState<Service>("full-service");
  const [packageTier, setPackageTier] = useState<PackageTier>("DEFAULT_PLUS_ACCOUNTING");
  const [fund, setFund] = useState({
    fundName: "Smith Family Superannuation Fund",
    matterType: "NEW_SMSF_SETUP",
    trusteeStructure: "INDIVIDUAL",
    abn: "",
    tfn: "",
    establishmentDate: "2026-01-15",
    companyGroup: "",
    referrerName: "",
  });
  const [members, setMembers] = useState<Member[]>([
    { id: 1, firstName: "John", lastName: "Smith", email: "john@example.com", mobile: "" },
  ]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function next() {
    setError(null);
    if (step < 5) setStep(step + 1);
  }
  function prev() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }
  function addMember() {
    if (members.length >= 6) return;
    setMembers([
      ...members,
      { id: members.length + 1, firstName: "", lastName: "", email: "", mobile: "" },
    ]);
  }
  function removeMember(id: number) {
    if (members.length === 1) return;
    setMembers(members.filter((m) => m.id !== id));
  }
  function updateMember(id: number, key: keyof Member, value: string) {
    setMembers(members.map((m) => (m.id === id ? { ...m, [key]: value } : m)));
  }

  function handleSubmit() {
    setError(null);
    const fd = new FormData();
    fd.set("service", service);
    fd.set("packageTier", packageTier);
    fd.set("fundName", fund.fundName);
    fd.set("matterType", fund.matterType);
    fd.set("trusteeStructure", fund.trusteeStructure);
    fd.set("companyGroup", fund.companyGroup);
    fd.set("abn", fund.abn);
    fd.set("tfn", fund.tfn);
    fd.set("referrerName", fund.referrerName);
    fd.set("establishmentDate", fund.establishmentDate);
    members.forEach((m, i) => {
      const idx = i + 1;
      fd.set(`members.${idx}.firstName`, m.firstName);
      fd.set(`members.${idx}.lastName`, m.lastName);
      fd.set(`members.${idx}.email`, m.email);
      fd.set(`members.${idx}.mobile`, m.mobile);
    });
    startTransition(async () => {
      const result = await submitOnboarding(fd);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const current = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-[2px] text-[11px] font-bold",
                  done && "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange)] text-white",
                  current && !done && "border-[color:var(--color-aap-dark)] bg-white text-[color:var(--color-aap-dark)]",
                  !current && !done && "border-[color:var(--color-aap-surface2)] bg-white text-[color:var(--color-aap-text3)]",
                )}
              >
                {done ? "✓" : s.id}
              </div>
              <span
                className={cn(
                  "text-[13px] font-medium",
                  done && "text-[color:var(--color-aap-orange)]",
                  current && "font-semibold text-[color:var(--color-aap-dark)]",
                  !done && !current && "text-[color:var(--color-aap-text3)]",
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "h-px w-8",
                    done ? "bg-[color:var(--color-aap-orange)]" : "bg-[color:var(--color-aap-surface2)]",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Step labelText={`Step 1 of 5`} title="Choose your administration service" subtitle="Select how you'd like your SMSF administered">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectableCard
              selected={service === "full-service"}
              onClick={() => setService("full-service")}
              badge="Full-Service"
              title="Admin Autopilot Administration"
              description="Professional SMSF administration. ASIC, ATO and compliance handled for you. Dedicated bookkeeper, compliance officer and tax agent assigned to your file."
            />
            <SelectableCard
              selected={service === "byoa"}
              onClick={() => setService("byoa")}
              badge="External Admin"
              badgeMuted
              title="Bring Your Own Administrator"
              description="Use your existing administrator — platform access remains free. You manage all lodgements and compliance."
            />
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step labelText="Step 2 of 5" title="Select your package" subtitle="Choose the administration package that suits your SMSF">
          <div className="grid gap-3.5 md:grid-cols-3">
            <PkgCard
              selected={packageTier === "DEFAULT_PLUS_ACCOUNTING"}
              onClick={() => setPackageTier("DEFAULT_PLUS_ACCOUNTING")}
              badge="⭐ Most popular"
              badgeColor="#15803d"
              badgeBg="#f0fdf4"
              name="Default + Accounting"
              price="$999"
              priceSub="AUD/year"
              features={[
                "ASIC annual review fees",
                "ATO registration & compliance",
                "Full accounting services",
                "Annual audit coordination",
                "Tax return lodgement",
                "Stocks, ETFs, crypto & cash",
              ]}
            />
            <PkgCard
              selected={packageTier === "UNLISTED_ASSETS"}
              onClick={() => setPackageTier("UNLISTED_ASSETS")}
              badge="🏢 Unlisted assets"
              badgeColor="#ffffff"
              badgeBg="#e8591a"
              name="Default + Unlisted"
              price="$1,149"
              priceSub="AUD/year"
              features={[
                "Everything in Default",
                "Unlisted asset support",
                "Private equity & debt",
                "Managed investment schemes",
              ]}
            />
            <PkgCard
              selected={packageTier === "BYOA"}
              onClick={() => setPackageTier("BYOA")}
              badge="🧾 Bring your accountant"
              badgeColor="#1d4ed8"
              badgeBg="#eff6ff"
              name="BYOA Package"
              price="$1,399"
              priceSub="AUD/year"
              features={[
                "ASIC & ATO compliance",
                "Annual audit coordination",
                "Tax return preparation",
                "Compliance monitoring",
              ]}
            />
          </div>
        </Step>
      )}

      {step === 3 && (
        <Step labelText="Step 3 of 5" title="Fund details" subtitle="Tell us about your self-managed super fund">
          <div className="max-w-[600px] space-y-3.5">
            <Field label="SMSF name">
              <input
                className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                value={fund.fundName}
                onChange={(e) => setFund({ ...fund, fundName: e.target.value })}
                placeholder="e.g. Smith Family Superannuation Fund"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3.5">
              <Field label="ABN (if registered)">
                <input
                  className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                  value={fund.abn}
                  onChange={(e) => setFund({ ...fund, abn: e.target.value })}
                  placeholder="12 345 678 901"
                />
              </Field>
              <Field label="TFN (if known)">
                <input
                  className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                  value={fund.tfn}
                  onChange={(e) => setFund({ ...fund, tfn: e.target.value })}
                />
              </Field>
              <Field label="Establishment date">
                <input
                  type="date"
                  className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                  value={fund.establishmentDate}
                  onChange={(e) => setFund({ ...fund, establishmentDate: e.target.value })}
                />
              </Field>
              <Field label="Fund type">
                <select
                  className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                  value={fund.matterType}
                  onChange={(e) => setFund({ ...fund, matterType: e.target.value })}
                >
                  <option value="NEW_SMSF_SETUP">New SMSF Setup</option>
                  <option value="EXISTING_ONBOARDING">Existing SMSF — Takeover</option>
                  <option value="CORPORATE_TRUSTEE_SETUP">SMSF + Corporate Trustee</option>
                </select>
              </Field>
              <Field label="Company group / referrer">
                <select
                  className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                  value={fund.companyGroup}
                  onChange={(e) => setFund({ ...fund, companyGroup: e.target.value })}
                >
                  <option value="">— Select firm —</option>
                  <option value="Clime ASX">Clime ASX</option>
                  <option value="Liberty">Liberty</option>
                  <option value="RiverX">RiverX</option>
                  <option value="Admin Autopilot">AAP (direct)</option>
                </select>
              </Field>
              <Field label="Referrer name (optional)">
                <input
                  className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                  value={fund.referrerName}
                  onChange={(e) => setFund({ ...fund, referrerName: e.target.value })}
                />
              </Field>
            </div>
            <div className="rounded-xl border-[1.5px] border-[color:var(--color-aap-surface2)] p-5">
              <div className="mb-3.5 text-[13px] font-semibold">Trustee structure</div>
              <div className="flex gap-3">
                {[
                  { key: "INDIVIDUAL", label: "Individual trustees" },
                  { key: "CORPORATE", label: "Corporate trustee" },
                ].map((opt) => {
                  const isSelected = fund.trusteeStructure === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFund({ ...fund, trusteeStructure: opt.key })}
                      className={cn(
                        "flex flex-1 items-center gap-2 rounded-lg border-[1.5px] px-3 py-3 text-left text-[13px] font-medium transition-colors",
                        isSelected
                          ? "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange-light)] text-[color:var(--color-aap-orange)]"
                          : "border-[color:var(--color-aap-surface2)] text-[color:var(--color-aap-text2)]",
                      )}
                    >
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full border-[2px]",
                          isSelected
                            ? "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange)]"
                            : "border-[color:var(--color-aap-surface2)]",
                        )}
                      />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Step>
      )}

      {step === 4 && (
        <Step labelText="Step 4 of 5" title="Fund members & trustees" subtitle="Add all members (maximum 6)">
          <div className="space-y-3">
            {members.map((m, idx) => (
              <div key={m.id} className="rounded-xl border-[1.5px] border-[color:var(--color-aap-surface2)] p-4 max-w-[640px]">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[13px] font-semibold">
                    Member {idx + 1}
                    {idx === 0 ? " (primary contact)" : ""}
                  </div>
                  {members.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      className="text-[color:var(--color-aap-red)] hover:opacity-80"
                      aria-label="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name">
                    <input
                      className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                      value={m.firstName}
                      onChange={(e) => updateMember(m.id, "firstName", e.target.value)}
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                      value={m.lastName}
                      onChange={(e) => updateMember(m.id, "lastName", e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                      value={m.email}
                      onChange={(e) => updateMember(m.id, "email", e.target.value)}
                    />
                  </Field>
                  <Field label="Mobile">
                    <input
                      className="w-full rounded-lg border-[1.5px] border-[color:var(--color-aap-surface2)] px-3 py-2.5 text-sm focus:border-[color:var(--color-aap-orange)] focus:outline-none"
                      value={m.mobile}
                      onChange={(e) => updateMember(m.id, "mobile", e.target.value)}
                      placeholder="+61 4XX XXX XXX"
                    />
                  </Field>
                </div>
              </div>
            ))}
            {members.length < 6 ? (
              <button
                type="button"
                onClick={addMember}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-3 py-2 text-[13px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
              >
                <Plus className="h-3.5 w-3.5" /> Add member
              </button>
            ) : null}
          </div>
        </Step>
      )}

      {step === 5 && (
        <Step labelText="Step 5 of 5" title="Review your setup" subtitle="Confirm everything before we create your SMSF matter">
          <div className="space-y-4">
            <ReviewSection title="Administration" onEdit={() => setStep(1)}>
              <ReviewRow label="Provider" value={service === "full-service" ? "Admin Autopilot" : "Bring Your Own Administrator"} />
              <ReviewRow label="Package" value={`${PRICES[packageTier].price} · ${PRICES[packageTier].label}`} />
            </ReviewSection>
            <ReviewSection title="Fund details" onEdit={() => setStep(3)}>
              <ReviewRow label="Fund name" value={fund.fundName} />
              <ReviewRow label="Company group" value={fund.companyGroup || "—"} />
              <ReviewRow label="Type" value={matterTypeLabel(fund.matterType)} />
              <ReviewRow label="Trustee structure" value={fund.trusteeStructure === "INDIVIDUAL" ? "Individual trustees" : "Corporate trustee"} />
              <ReviewRow label="ABN" value={fund.abn || "—"} />
            </ReviewSection>
            <ReviewSection title="Members" onEdit={() => setStep(4)}>
              {members.map((m, i) => (
                <ReviewRow
                  key={m.id}
                  label={`Member ${i + 1}${i === 0 ? " (primary)" : ""}`}
                  value={`${m.firstName} ${m.lastName}${m.email ? ` · ${m.email}` : ""}`}
                />
              ))}
            </ReviewSection>
            <div className="rounded-xl border-[1.5px] border-[color:var(--color-aap-orange-border)] bg-[color:var(--color-aap-orange-light)] px-5 py-4 max-w-[640px] flex items-center justify-between">
              <div className="text-[14px] font-semibold">Annual administration fee</div>
              <div className="text-[22px] font-extrabold text-[color:var(--color-aap-orange)]">
                {PRICES[packageTier].price} AUD/year
              </div>
            </div>
            <div className="max-w-[500px] text-[12px] leading-5 text-[color:var(--color-aap-text3)]">
              By proceeding you authorise Admin Autopilot to act as your registered tax agent for SMSF lodgement purposes.
            </div>
            {error ? <div className="text-[13px] text-[color:var(--color-aap-red)]">{error}</div> : null}
          </div>
        </Step>
      )}

      {/* Footer */}
      <div className="mt-10 flex items-center justify-between border-t pt-5">
        <button
          type="button"
          onClick={prev}
          disabled={step === 1}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-aap-surface2)] bg-white px-4 py-2 text-[13px] font-semibold transition-colors",
            step === 1
              ? "invisible"
              : "text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-text2)] hover:text-[color:var(--color-aap-dark)]",
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="text-[12px] text-[color:var(--color-aap-text3)]">Takes about 5 minutes</div>
        {step < 5 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--color-aap-orange)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)]"
          >
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--color-aap-orange)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[color:var(--color-aap-orange-2)] disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create matter"}{" "}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Step({
  labelText,
  title,
  subtitle,
  children,
}: {
  labelText: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--color-aap-orange)]">
        {labelText}
      </div>
      <h1 className="mt-2 text-[26px] font-bold tracking-tight">{title}</h1>
      <p className="mb-8 mt-1 text-[15px] text-[color:var(--color-aap-text2)]">{subtitle}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-[color:var(--color-aap-dark)]">{label}</label>
      {children}
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  badge,
  badgeMuted = false,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  badge: string;
  badgeMuted?: boolean;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-xl border-[2px] p-5 text-left transition-colors",
        selected
          ? "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange-light)]"
          : "border-[color:var(--color-aap-surface2)] hover:border-[color:var(--color-aap-orange-border)]",
      )}
    >
      <span
        className={cn(
          "absolute right-4 top-4 flex h-5.5 w-5.5 items-center justify-center rounded-full border-[2px]",
          selected
            ? "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange)] text-white"
            : "border-[color:var(--color-aap-surface2)] text-transparent",
        )}
        style={{ width: 22, height: 22 }}
      >
        ✓
      </span>
      <span
        className={cn(
          "mb-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
          badgeMuted
            ? "bg-[color:var(--color-aap-surface2)] text-[color:var(--color-aap-text2)]"
            : "bg-[color:var(--color-aap-orange)] text-white",
        )}
      >
        {badge}
      </span>
      <div className="text-[17px] font-bold">{title}</div>
      <div className="mt-1.5 text-[13px] leading-5 text-[color:var(--color-aap-text2)]">{description}</div>
    </button>
  );
}

function PkgCard({
  selected,
  onClick,
  badge,
  badgeColor,
  badgeBg,
  name,
  price,
  priceSub,
  features,
}: {
  selected: boolean;
  onClick: () => void;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  name: string;
  price: string;
  priceSub: string;
  features: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-xl border-[2px] p-6 text-left transition-colors",
        selected
          ? "border-[color:var(--color-aap-orange)] bg-[color:var(--color-aap-orange-light)]"
          : "border-[color:var(--color-aap-surface2)] hover:border-[color:var(--color-aap-orange-border)]",
      )}
    >
      <span
        className="mb-2.5 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{ background: badgeBg, color: badgeColor }}
      >
        {badge}
      </span>
      <div className="text-[17px] font-bold">{name}</div>
      <div className="mt-1 text-[30px] font-extrabold tracking-tight text-[color:var(--color-aap-orange)]">
        {price}
      </div>
      <div className="text-[12px] text-[color:var(--color-aap-text3)]">{priceSub}</div>
      <ul className="mt-3 space-y-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-[13px] text-[color:var(--color-aap-text2)] leading-5">
            <span className="text-[color:var(--color-aap-green)]">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

function ReviewSection({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="max-w-[640px] rounded-xl border-[1.5px] border-[color:var(--color-aap-surface2)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--color-aap-text3)]">
          {title}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-[color:var(--color-aap-surface2)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[color:var(--color-aap-text2)] hover:border-[color:var(--color-aap-orange)] hover:text-[color:var(--color-aap-orange)]"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[color:var(--color-aap-surface2)] py-1.5 text-[13px] last:border-b-0">
      <div className="text-[color:var(--color-aap-text2)]">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function matterTypeLabel(t: string): string {
  switch (t) {
    case "NEW_SMSF_SETUP":
      return "New SMSF Setup";
    case "EXISTING_ONBOARDING":
      return "Existing SMSF — Takeover";
    case "CORPORATE_TRUSTEE_SETUP":
      return "SMSF + Corporate Trustee";
    default:
      return t;
  }
}
