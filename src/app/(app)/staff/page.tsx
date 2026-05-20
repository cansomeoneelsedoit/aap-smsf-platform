import { prisma } from "@/lib/prisma";
import { initialsFromName, staffColorForRole, staffRoleLabel } from "@/lib/display";

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({
    include: { user: true, companyGroup: true },
    orderBy: [{ role: "asc" }],
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Staff profiles</h2>
        <p className="text-[13px] text-[color:var(--color-aap-text2)]">
          Team members visible to clients via the portal. Each owns one of the workflow stages.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {staff.map((s) => {
          const initials = initialsFromName(s.user.name);
          const color = staffColorForRole(s.role);
          return (
            <div key={s.id} className="rounded-xl border bg-white p-6 text-center">
              <span
                className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-extrabold text-white"
                style={{ background: color }}
              >
                {initials}
              </span>
              <div className="text-[18px] font-extrabold">{s.user.name}</div>
              <div className="text-[13px] font-semibold" style={{ color }}>
                {staffRoleLabel(s.role)}
              </div>
              {s.experienceYears ? (
                <div className="text-[12px] text-[color:var(--color-aap-text2)]">
                  {s.experienceYears} years experience
                </div>
              ) : null}
              {s.bio ? (
                <div className="mt-3 rounded-lg bg-[color:var(--color-aap-surface)] p-3 text-left text-[12px] leading-6 text-[color:var(--color-aap-text2)]">
                  {s.bio}
                  {s.hobbies ? (
                    <div className="mt-1.5">
                      <span className="font-semibold">Outside work:</span> {s.hobbies}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
