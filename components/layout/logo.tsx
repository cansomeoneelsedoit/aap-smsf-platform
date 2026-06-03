import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? 28 : 36;
  const textSize = size === "sm" ? "text-[15px]" : "text-lg";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 36 36" fill="none" aria-hidden>
        <path
          d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z"
          fill="#fef3ee"
          stroke="#e8591a"
          strokeWidth="1.5"
        />
        <circle cx="18" cy="18" r="2.5" fill="#e8591a" />
        <path
          d="M18 8v8M10 14l6.5 3M26 14l-6.5 3"
          stroke="#e8591a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("font-bold tracking-tight text-brand-dark", textSize)}>
        Admin Autopilot
      </span>
    </div>
  );
}
