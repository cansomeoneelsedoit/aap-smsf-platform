import { Card, CardContent } from "@/components/ui/card";

export default function PortalDocumentsPage() {
  return (
    <>
      <h2 className="mb-4 text-[15px] font-bold">Your documents</h2>
      <Card>
        <CardContent className="space-y-2 pt-4">
          {[
            { name: "Smith_Family_SMSF_Trust_Deed.pdf", meta: "FY2026 · Signed · 18 Mar 2026" },
            { name: "John_Smith_Passport.pdf", meta: "FY2026 · KYC verified" },
            { name: "Mary_Smith_ID.pdf", meta: "FY2026 · Pending verification" },
          ].map((d) => (
            <div key={d.name} className="flex items-center gap-2.5 rounded-brand-sm border border-brand-border p-3">
              <span>📄</span>
              <div>
                <div className="text-[13px] font-medium">{d.name}</div>
                <div className="text-[11px] text-brand-text-3">{d.meta}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
